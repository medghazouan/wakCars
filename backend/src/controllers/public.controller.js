const prisma = require('../utils/prisma');
const emailService = require('../services/email.service');
const { normalizeBookingSource } = require('../utils/bookingSource');
const { success, created, notFound, fail } = require('../utils/apiResponse');

const LIST_IMAGE_INCLUDE = {
  images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], take: 1 },
};

const PUBLIC_CAR_INCLUDE = {
  category: { select: { id: true, name_fr: true, name_ar: true, slug: true } },
  ...LIST_IMAGE_INCLUDE,
};

const FULL_PUBLIC_CAR_INCLUDE = {
  category: { select: { id: true, name_fr: true, name_ar: true, slug: true } },
  images: { orderBy: { sort_order: 'asc' } },
};

const publicCarWhere = {
  is_active: true,
  status: 'AVAILABLE',
};

const calcDays = (pickup, dropoff) =>
  Math.max(1, Math.ceil((new Date(dropoff) - new Date(pickup)) / (1000 * 60 * 60 * 24)));

const computeTotal = async (carId, pickupDate, dropoffDate, hasGps, hasChildSeat) => {
  const car = await prisma.cars.findUnique({ where: { id: carId } });
  if (!car) throw Object.assign(new Error('Car not found'), { status: 404 });

  const gpsSetting = await prisma.site_settings.findUnique({ where: { settingKey: 'gps_daily_price' } });
  const seatSetting = await prisma.site_settings.findUnique({ where: { settingKey: 'child_seat_daily_price' } });

  const days = calcDays(pickupDate, dropoffDate);
  const gpsPrice = hasGps ? days * parseFloat(gpsSetting?.value_fr || '50') : 0;
  const seatPrice = hasChildSeat ? days * parseFloat(seatSetting?.value_fr || '30') : 0;
  return Number(car.price_per_day) * days + gpsPrice + seatPrice;
};

/** GET /cars — catalog */
const listCars = async (req, res, next) => {
  try {
    const {
      category_id,
      category_slug,
      fuel_type,
      transmission,
      is_featured,
      page = 1,
      limit = 50,
    } = req.query;
    const where = { ...publicCarWhere };
    if (category_id) where.category_id = parseInt(category_id, 10);
    if (category_slug && !where.category_id) {
      const cat = await prisma.car_categories.findFirst({
        where: { slug: String(category_slug), is_active: true },
      });
      if (cat) where.category_id = cat.id;
    }
    if (fuel_type) where.fuel_type = fuel_type;
    if (transmission) where.transmission = transmission;
    if (is_featured !== undefined) where.is_featured = is_featured === 'true' || is_featured === '1';

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [cars, total] = await Promise.all([
      prisma.cars.findMany({
        where,
        include: PUBLIC_CAR_INCLUDE,
        skip,
        take: parseInt(limit, 10),
        orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
      }),
      prisma.cars.count({ where }),
    ]);
    return success(res, cars, 200, { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

/** GET /cars/featured */
const featuredCars = async (req, res, next) => {
  try {
    const cars = await prisma.cars.findMany({
      where: { ...publicCarWhere, is_featured: true },
      include: PUBLIC_CAR_INCLUDE,
      take: 12,
      orderBy: { created_at: 'desc' },
    });
    return success(res, cars);
  } catch (err) {
    next(err);
  }
};

/** GET /cars/check-availability */
const checkAvailability = async (req, res, next) => {
  try {
    const { car_id, from, to } = req.query;
    if (!car_id || !from || !to) {
      return fail(res, 'car_id, from, and to (ISO dates) are required', 400);
    }
    const carIdInt = parseInt(car_id, 10);
    const fromD = new Date(from);
    const toD = new Date(to);
    const overlap = await prisma.reservations.findFirst({
      where: {
        car_id: carIdInt,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        AND: [{ pickup_date: { lte: toD } }, { dropoff_date: { gte: fromD } }],
      },
    });
    return success(res, { available: !overlap });
  } catch (err) {
    next(err);
  }
};

/** GET /cars/:slugOrId — numeric id or slug string */
const getCarBySlugOrId = async (req, res, next) => {
  try {
    const raw = req.params.slugOrId;
    const isNumeric = /^\d+$/.test(String(raw));
    const car = isNumeric
      ? await prisma.cars.findFirst({
          where: { id: parseInt(raw, 10), ...publicCarWhere },
          include: FULL_PUBLIC_CAR_INCLUDE,
        })
      : await prisma.cars.findFirst({
          where: { slug: String(raw), ...publicCarWhere },
          include: FULL_PUBLIC_CAR_INCLUDE,
        });
    if (!car) return notFound(res, 'Car');
    return success(res, car);
  } catch (err) {
    next(err);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const categories = await prisma.car_categories.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return success(res, categories);
  } catch (err) {
    next(err);
  }
};

const listLocations = async (req, res, next) => {
  try {
    const locations = await prisma.locations.findMany({ orderBy: { name_fr: 'asc' } });
    return success(res, locations);
  } catch (err) {
    next(err);
  }
};

const listBlog = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const where = { is_published: true };
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [posts, total] = await Promise.all([
      prisma.blog_posts.findMany({
        where,
        select: {
          id: true,
          slug_fr: true,
          slug_ar: true,
          title_fr: true,
          title_ar: true,
          excerpt_fr: true,
          excerpt_ar: true,
          cover_image: true,
          category: true,
          published_at: true,
          created_at: true,
        },
        skip,
        take: parseInt(limit, 10),
        orderBy: { published_at: 'desc' },
      }),
      prisma.blog_posts.count({ where }),
    ]);
    return success(res, posts, 200, { total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { lang = 'fr' } = req.query;
    const where =
      lang === 'ar'
        ? { slug_ar: slug, is_published: true }
        : { slug_fr: slug, is_published: true };
    const post = await prisma.blog_posts.findFirst({
      where,
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) return notFound(res, 'Blog post');
    return success(res, post);
  } catch (err) {
    next(err);
  }
};

const listFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { is_published: true };
    if (category) where.category = category;
    const faqs = await prisma.faqs.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
    });
    return success(res, faqs);
  } catch (err) {
    next(err);
  }
};

/**
 * Flat settings map for the marketing site.
 * Without `lang`: uses value_fr, then value_ar (stable for prices / booking).
 * With `lang=fr|ar`: prefers that locale, then falls back to the other.
 */
// Only expose settings the marketing site actually needs
const PUBLIC_SETTINGS_WHITELIST = new Set([
  // Footer / contact
  'footer_facebook_url', 'footer_instagram_url', 'footer_phone', 'footer_email',
  'footer_address', 'footer_opening_hours', 'footer_description',
  'footer_whatsapp_phone', 'footer_map_embed_url',
  'contact_phone', 'contact_email', 'contact_whatsapp',
  'contact_address_fr', 'contact_address_ar',
  'business_hours', 'site_tagline', 'google_maps_embed',
  // Pricing / booking
  'gps_daily_price', 'child_seat_daily_price', 'deposit_default',
  // SEO / hero
  'hero_title', 'hero_subtitle', 'hero_cta',
  'meta_title', 'meta_description',
  'working_hours', 'booking_note', 'company_name',
]);

const publicSettings = async (req, res, next) => {
  try {
    const lang = String(req.query.lang || '').toLowerCase();
    const preferAr = lang === 'ar';
    const preferFr = lang === 'fr';
    const rows = await prisma.site_settings.findMany();
    const flat = {};
    for (const s of rows) {
      if (!PUBLIC_SETTINGS_WHITELIST.has(s.settingKey)) continue;
      let v;
      if (preferAr) {
        v = s.value_ar != null && s.value_ar !== '' ? s.value_ar : (s.value_fr ?? '');
      } else if (preferFr) {
        v = s.value_fr != null && s.value_fr !== '' ? s.value_fr : (s.value_ar ?? '');
      } else {
        v = s.value_fr ?? s.value_ar ?? '';
      }
      flat[s.settingKey] = v;
    }
    return success(res, flat);
  } catch (err) {
    next(err);
  }
};

const guestReservation = async (req, res, next) => {
  try {
    const {
      car_id,
      pickup_location_id,
      dropoff_location_id,
      pickup_date,
      dropoff_date,
      has_gps = false,
      has_child_seat = false,
      guest_first_name,
      guest_last_name,
      guest_email,
      guest_phone,
      booking_source: rawSource,
    } = req.body;

    if (!guest_first_name || !guest_last_name || !guest_phone) {
      return fail(res, 'guest_first_name, guest_last_name, and guest_phone are required', 400);
    }

    const carIdInt = parseInt(car_id, 10);
    const car = await prisma.cars.findFirst({ where: { id: carIdInt, ...publicCarWhere } });
    if (!car) return notFound(res, 'Car');

    const overlap = await prisma.reservations.findFirst({
      where: {
        car_id: carIdInt,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        AND: [
          { pickup_date: { lte: new Date(dropoff_date) } },
          { dropoff_date: { gte: new Date(pickup_date) } },
        ],
      },
    });
    if (overlap) return fail(res, 'Car already has a reservation in this period', 409);

    const total_amount = await computeTotal(
      carIdInt,
      pickup_date,
      dropoff_date,
      Boolean(has_gps),
      Boolean(has_child_seat),
    );

    const phone = String(guest_phone).trim();
    const customer = await prisma.customers.upsert({
      where: { phone },
      create: {
        first_name: guest_first_name.trim(),
        last_name: guest_last_name.trim(),
        phone,
        email: guest_email ? String(guest_email).trim() : null,
      },
      update: {
        first_name: guest_first_name.trim(),
        last_name: guest_last_name.trim(),
        email: guest_email ? String(guest_email).trim() : undefined,
      },
    });

    const booking_source = normalizeBookingSource(rawSource);

    const reservation = await prisma.reservations.create({
      data: {
        car_id: carIdInt,
        customer_id: customer.id,
        pickup_location_id: parseInt(pickup_location_id, 10),
        dropoff_location_id: parseInt(dropoff_location_id, 10),
        pickup_date: new Date(pickup_date),
        dropoff_date: new Date(dropoff_date),
        has_gps: Boolean(has_gps),
        has_child_seat: Boolean(has_child_seat),
        total_amount,
        status: 'PENDING',
        booking_source,
      },
      include: {
        car: { include: { images: { where: { is_primary: true }, take: 1 } } },
        customer: true,
        pickup_location: true,
        dropoff_location: true,
      },
    });

    return created(res, reservation);
  } catch (err) {
    next(err);
  }
};

const contactMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return fail(res, 'name, email, and message are required', 400);
    }
    await emailService.sendContactForm({ name, email, message });
    return success(res, { received: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCars,
  featuredCars,
  checkAvailability,
  getCarBySlugOrId,
  listCategories,
  listLocations,
  listBlog,
  getBlogBySlug,
  listFaqs,
  publicSettings,
  guestReservation,
  contactMessage,
};
