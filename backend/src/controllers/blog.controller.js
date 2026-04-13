const prisma = require('../utils/prisma');
const cloudinary = require('../services/cloudinary.service');
const { success, created, noContent, notFound, fail } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { is_published, is_featured, category, page = 1, limit = 20 } = req.query;
    const where = {};
    if (is_published !== undefined) where.is_published = is_published === 'true' || is_published === '1';
    if (is_featured !== undefined) where.is_featured = is_featured === 'true' || is_featured === '1';
    if (category) where.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      prisma.blog_posts.findMany({
        where,
        select: {
          id: true, slug_fr: true, slug_ar: true, title_fr: true, title_ar: true,
          excerpt_fr: true, excerpt_ar: true, cover_image: true, category: true,
          is_published: true, is_featured: true, published_at: true, created_at: true,
          author: { select: { id: true, name: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.blog_posts.count({ where }),
    ]);
    return success(res, posts, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const post = await prisma.blog_posts.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) return notFound(res, 'Blog post');
    return success(res, post);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const {
      slug_fr, slug_ar, title_fr, title_ar, excerpt_fr, excerpt_ar,
      content_fr, content_ar, cover_image, cover_alt, meta_title_fr, meta_title_ar,
      meta_desc_fr, meta_desc_ar, category, tags, is_published = false, is_featured = false,
    } = req.body;

    const post = await prisma.blog_posts.create({
      data: {
        slug_fr, slug_ar, title_fr, title_ar, excerpt_fr, excerpt_ar,
        content_fr, content_ar, cover_image, cover_alt, meta_title_fr, meta_title_ar,
        meta_desc_fr, meta_desc_ar, category, tags,
        is_published: Boolean(is_published),
        is_featured: Boolean(is_featured),
        published_at: is_published ? new Date() : undefined,
        author_id: req.admin.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return created(res, post);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.blog_posts.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Blog post');

    const fields = [
      'slug_fr', 'slug_ar', 'title_fr', 'title_ar', 'excerpt_fr', 'excerpt_ar',
      'content_fr', 'content_ar', 'cover_image', 'cover_alt', 'meta_title_fr',
      'meta_title_ar', 'meta_desc_fr', 'meta_desc_ar', 'category', 'tags',
      'is_published', 'is_featured',
    ];
    const data = {};
    fields.forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    if ('is_published' in data) data.is_published = Boolean(data.is_published);
    if ('is_featured' in data) data.is_featured = Boolean(data.is_featured);

    const post = await prisma.blog_posts.update({
      where: { id }, data,
      include: { author: { select: { id: true, name: true } } },
    });
    return success(res, post);
  } catch (err) { next(err); }
};

const togglePublish = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.blog_posts.findUnique({ where: { id } });
    if (!post) return notFound(res, 'Blog post');

    const is_published = !post.is_published;
    const updated = await prisma.blog_posts.update({
      where: { id },
      data: { is_published, published_at: is_published ? new Date() : post.published_at },
    });
    return success(res, updated);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.blog_posts.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Blog post');
    await prisma.blog_posts.delete({ where: { id } });
    return noContent(res);
  } catch (err) { next(err); }
};

const uploadCover = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.blog_posts.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Blog post');
    if (!req.file?.buffer) return fail(res, 'Cover image file required', 400);

    const { url } = await cloudinary.uploadImage(req.file.buffer, 'blog');
    const post = await prisma.blog_posts.update({
      where: { id },
      data: { cover_image: url },
      include: { author: { select: { id: true, name: true } } },
    });
    return success(res, post);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, togglePublish, remove, uploadCover };
