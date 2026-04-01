const router = require('express').Router();
const ctrl = require('../controllers/public.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const guestReservationRules = [
  body('car_id').isInt({ min: 1 }),
  body('pickup_location_id').isInt({ min: 1 }),
  body('dropoff_location_id').isInt({ min: 1 }),
  body('pickup_date').isISO8601(),
  body('dropoff_date')
    .isISO8601()
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.pickup_date)) {
        throw new Error('dropoff_date must be after pickup_date');
      }
      return true;
    }),
  body('guest_first_name').trim().notEmpty(),
  body('guest_last_name').trim().notEmpty(),
  body('guest_phone').trim().notEmpty(),
  body('guest_email').optional().isEmail(),
  body('has_gps').optional().isBoolean(),
  body('has_child_seat').optional().isBoolean(),
];

const contactRules = [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('message').trim().isLength({ min: 10 }),
];

router.get('/cars/featured', ctrl.featuredCars);
router.get('/cars/check-availability', ctrl.checkAvailability);
router.get('/cars', ctrl.listCars);
router.get('/cars/:slugOrId', ctrl.getCarBySlugOrId);

router.get('/categories', ctrl.listCategories);
router.get('/locations', ctrl.listLocations);

router.get('/blog', ctrl.listBlog);
router.get('/blog/:slug', ctrl.getBlogBySlug);

router.get('/faqs', ctrl.listFaqs);
router.get('/settings', ctrl.publicSettings);

router.post('/reservations', ...guestReservationRules, validate, ctrl.guestReservation);
router.post('/contact', ...contactRules, validate, ctrl.contactMessage);

module.exports = router;
