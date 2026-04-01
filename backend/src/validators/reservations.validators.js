const { body, param } = require('express-validator');

const STATUSES = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'];

const createRules = [
  body('car_id').isInt({ min: 1 }).withMessage('Valid car_id required'),
  body('pickup_location_id').isInt({ min: 1 }).withMessage('Valid pickup_location_id required'),
  body('dropoff_location_id').isInt({ min: 1 }).withMessage('Valid dropoff_location_id required'),
  body('pickup_date').isISO8601().withMessage('Valid pickup_date required (ISO 8601)'),
  body('dropoff_date')
    .isISO8601()
    .withMessage('Valid dropoff_date required (ISO 8601)')
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.pickup_date)) {
        throw new Error('dropoff_date must be after pickup_date');
      }
      return true;
    }),
  body('customer_id').optional().isInt({ min: 1 }).withMessage('Valid customer_id'),
  body('has_gps').optional().isBoolean(),
  body('has_child_seat').optional().isBoolean(),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('booking_source').optional().isString().isLength({ max: 50 }),
];

const updateRules = createRules.map((r) => r.optional());

const statusRules = [
  param('id').isInt({ min: 1 }),
  body('status').isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
];

const reassignRules = [
  param('id').isInt({ min: 1 }),
  body('car_id').isInt({ min: 1 }).withMessage('Valid car_id required'),
];

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid reservation id required')];

const paymentRules = [
  param('id').isInt({ min: 1 }),
  body('payment_status')
    .isIn(PAYMENT_STATUSES)
    .withMessage(`payment_status must be one of: ${PAYMENT_STATUSES.join(', ')}`),
];

module.exports = {
  createRules,
  updateRules,
  statusRules,
  reassignRules,
  paymentRules,
  idParam,
};
