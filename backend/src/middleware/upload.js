const multer = require('multer');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Magic byte signatures for allowed image types
const MAGIC_BYTES = {
  'image/jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  'image/webp': [Buffer.from('RIFF')], // RIFF....WEBP
};

/** Verify file buffer starts with expected magic bytes for its declared MIME type. */
function validateMagicBytes(buffer, mimetype) {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return false;
  if (mimetype === 'image/webp') {
    // RIFF at offset 0, WEBP at offset 8
    return buffer.length >= 12
      && buffer.slice(0, 4).toString('ascii') === 'RIFF'
      && buffer.slice(8, 12).toString('ascii') === 'WEBP';
  }
  return signatures.some((sig) => {
    if (buffer.length < sig.length) return false;
    return buffer.slice(0, sig.length).equals(sig);
  });
}

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const baseUpload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

// Wrap multer methods to add magic-byte validation after buffer is available
function withMagicByteCheck(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      const files = req.files || (req.file ? [req.file] : []);
      for (const file of files) {
        if (!validateMagicBytes(file.buffer, file.mimetype)) {
          return res.status(400).json({ success: false, error: 'File content does not match its declared type' });
        }
      }
      next();
    });
  };
}

const upload = {
  single: (field) => withMagicByteCheck(baseUpload.single(field)),
  array: (field, max) => withMagicByteCheck(baseUpload.array(field, max)),
};

module.exports = upload;
