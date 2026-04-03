const prisma = require('./prisma');

/**
 * Merge `car` onto rows that have `car_id` (reservations, policies, technical_visits, damage_reports, …).
 * Avoids Prisma "Inconsistent query result" when car_id points to a deleted car.
 */
async function attachCarsToReservations(rows, carSelect, placeholderForId) {
  if (!rows?.length) return rows;
  const ids = [...new Set(rows.map((r) => r.car_id).filter((id) => id != null))];
  const cars = await prisma.cars.findMany({
    where: { id: { in: ids } },
    select: carSelect,
  });
  const map = new Map(cars.map((c) => [c.id, c]));
  return rows.map((r) => ({
    ...r,
    car: map.get(r.car_id) ?? placeholderForId(r.car_id),
  }));
}

/**
 * Merge `customer` onto reservation rows when customer_id is set but the row was deleted.
 */
async function attachCustomersToReservations(rows, customerSelect, placeholderForId) {
  if (!rows?.length) return rows;
  const ids = [...new Set(rows.map((r) => r.customer_id).filter((id) => id != null))];
  if (ids.length === 0) {
    return rows.map((r) => ({ ...r, customer: null }));
  }
  const customers = await prisma.customers.findMany({
    where: { id: { in: ids } },
    select: customerSelect,
  });
  const map = new Map(customers.map((c) => [c.id, c]));
  return rows.map((r) => ({
    ...r,
    customer:
      r.customer_id == null
        ? null
        : (map.get(r.customer_id) ?? placeholderForId(r.customer_id)),
  }));
}

module.exports = { attachCarsToReservations, attachCustomersToReservations };
