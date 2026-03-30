---
name: Postman API Test Plan
overview: Generate a Postman collection (JSON export) covering all 88 admin API endpoints across 17 route groups, organized into folders with pre-filled request bodies, test scripts for status codes, and environment variables for tokens/IDs. Also generate a seed-friendly Postman environment file.
todos:
  - id: fix-seed-hashes
    content: Create backend/scripts/seed-admin.js to regenerate valid bcrypt hashes for the 3 admin accounts and update them in the DB
    status: pending
  - id: postman-env
    content: Create wakcars-env.postman_environment.json with all variables (baseUrl, accessToken, cronSecret, entity IDs)
    status: pending
  - id: postman-collection
    content: Create wakcars-admin-api.postman_collection.json with all 88 requests across 17 folders, pre-filled bodies, auth headers, and test scripts
    status: pending
isProject: false
---

# Postman Admin API Test Plan

Create a complete Postman collection + environment file that covers **all 88 endpoints** across 17 route groups. The collection will be exported as a JSON file importable into Postman.

---

## Test Credentials (from seed data)

The SQL seed at [wakcars_schema.sql](wakcars_schema.sql) line 530 defines passwords:

- **ADMIN**: `rachid@wakcars.ma` / `Admin@2026!`
- **STAFF**: `nadia@wakcars.ma` / `Staff@2026!`
- **STAFF**: `omar@wakcars.ma` / `Staff@2026!`

The bcrypt hashes in the seed appear to be placeholder-style (ending `e40a`, `e40b`, `e40c`). Before testing, you need to **regenerate proper hashes** for these passwords and update the DB, OR create a small seed script that inserts admins with valid bcrypt hashes. This is critical -- without it, login will always fail.

---

## Deliverables

### 1. Postman Environment File (`wakcars-env.postman_environment.json`)

Variables:

- `baseUrl` = `http://localhost:3000`
- `accessToken` = (auto-set by login test script)
- `cronSecret` = `your_cron_secret_token`
- `carId` = `1` (from seed)
- `categoryId` = `1`
- `locationId` = `1`
- `customerId` = `1`
- `reservationId` = `1`
- `paymentId` = `1`
- `insuranceId` = `1`
- `technicalVisitId` = `1`
- `damageReportId` = `1`
- `blogPostId` = `1`
- `faqId` = `1`
- `carImageId` = `1`
- `damageImageId` = `1`

### 2. Postman Collection (`wakcars-admin-api.postman_collection.json`)

Organized into **17 folders** matching the route groups, each containing requests in a logical test order (create before get-by-id, etc.).

---

## Complete Endpoint Inventory (88 requests, grouped by folder)

### Folder 0: Health (1 request)

- `GET {{baseUrl}}/health`

### Folder 1: Auth (4 requests)

- `POST {{baseUrl}}/api/auth/login` -- body: `{ "email": "rachid@wakcars.ma", "password": "Admin@2026!" }` -- **Test script**: extract `accessToken` from response, set as env var
- `GET {{baseUrl}}/api/auth/me` -- header: `Authorization: Bearer {{accessToken}}`
- `POST {{baseUrl}}/api/auth/refresh` -- (uses HttpOnly cookie automatically)
- `POST {{baseUrl}}/api/auth/logout`

### Folder 2: Dashboard (1 request)

- `GET {{baseUrl}}/api/dashboard`

### Folder 3: Alerts (1 request)

- `GET {{baseUrl}}/api/alerts`

### Folder 4: Car Categories (5 requests)

- `GET {{baseUrl}}/api/categories`
- `GET {{baseUrl}}/api/categories/{{categoryId}}`
- `POST {{baseUrl}}/api/categories` -- body: `{ "name_fr": "Test Cat", "name_ar": "فئة تجريبية", "slug": "test-cat", "sort_order": 99 }` 

- `PUT {{baseUrl}}/api/categories/{{categoryId}}` -- body: `{ "name_fr": "Citadine Updated" }` 
- `DELETE {{baseUrl}}/api/categories/{{categoryId}}` -- (expect 409 if cars exist)

### Folder 5: Locations (5 requests)

- `GET {{baseUrl}}/api/locations`
- `GET {{baseUrl}}/api/locations/{{locationId}}`
- `POST {{baseUrl}}/api/locations` -- body: `{ "name_fr": "Gare Routiere", "name_ar": "محطة الحافلات", "slug": "gare-routiere", "address_fr": "Av Hassan II", "address_ar": "شارع الحسن الثاني", "city": "Marrakech" }`
- `PUT {{baseUrl}}/api/locations/{{locationId}}`
- `DELETE {{baseUrl}}/api/locations/{{locationId}}` -- (expect 409 if reservations reference it)

### Folder 6: Cars + Images (9 requests)

- `GET {{baseUrl}}/api/cars` -- query: `?status=AVAILABLE&page=1&limit=5`
- `GET {{baseUrl}}/api/cars?is_featured=true`
- `GET {{baseUrl}}/api/cars/{{carId}}`
- `POST {{baseUrl}}/api/cars` -- multipart/form-data with fields + optional image files
- `PUT {{baseUrl}}/api/cars/{{carId}}` -- body: `{ "price_per_day": 200 }`
- `PATCH {{baseUrl}}/api/cars/{{carId}}/status` -- body: `{ "status": "MAINTENANCE" }`
- `DELETE {{baseUrl}}/api/cars/{{carId}}` -- (soft-delete)
- `POST {{baseUrl}}/api/cars/{{carId}}/images` -- multipart/form-data with `image` file
- `DELETE {{baseUrl}}/api/cars/{{carId}}/images/{{carImageId}}`
- `PATCH {{baseUrl}}/api/cars/{{carId}}/images/{{carImageId}}/primary`

### Folder 7: Customers (4 requests)

- `GET {{baseUrl}}/api/customers` -- query: `?search=Youssef`
- `GET {{baseUrl}}/api/customers/{{customerId}}`
- `POST {{baseUrl}}/api/customers` -- body: `{ "first_name": "Test", "last_name": "Client", "phone": "+212600000001", "email": "test@example.com", "nationality": "Marocaine" }`
- `PUT {{baseUrl}}/api/customers/{{customerId}}` -- body: `{ "notes": "VIP customer" }`

### Folder 8: Reservations (7 requests)

- `GET {{baseUrl}}/api/reservations` -- query: `?status=ACTIVE&page=1&limit=10`
- `GET {{baseUrl}}/api/reservations/{{reservationId}}`
- `POST {{baseUrl}}/api/reservations` -- body:

```json
{
  "car_id": 3,
  "customer_id": 1,
  "pickup_location_id": 1,
  "dropoff_location_id": 2,
  "pickup_date": "2026-05-01T09:00:00Z",
  "dropoff_date": "2026-05-05T09:00:00Z",
  "has_gps": true,
  "has_child_seat": false
}
```

- `PUT {{baseUrl}}/api/reservations/{{reservationId}}` -- body: `{ "has_gps": false }`
- `PATCH {{baseUrl}}/api/reservations/{{reservationId}}/status` -- body: `{ "status": "CONFIRMED" }`
- `PATCH {{baseUrl}}/api/reservations/{{reservationId}}/confirm`
- `PATCH {{baseUrl}}/api/reservations/{{reservationId}}/reassign` -- body: `{ "car_id": 2 }`

### Folder 9: Payments (4 requests)

- `GET {{baseUrl}}/api/payments` -- query: `?reservation_id=1`
- `GET {{baseUrl}}/api/payments/{{paymentId}}`
- `POST {{baseUrl}}/api/payments` -- body: `{ "reservation_id": 4, "amount": 500, "method": "CASH", "notes": "Partial payment" }`
- `PUT {{baseUrl}}/api/payments/{{paymentId}}` -- body: `{ "notes": "Updated note" }`

### Folder 10: Insurance Policies (5 requests)

- `GET {{baseUrl}}/api/insurance` -- query: `?car_id=1`
- `GET {{baseUrl}}/api/insurance/{{insuranceId}}`
- `POST {{baseUrl}}/api/insurance` -- body: `{ "car_id": 1, "provider": "Test Insurance", "policy_number": "TEST-001", "start_date": "2026-04-01", "expiry_date": "2027-04-01" }`
- `PUT {{baseUrl}}/api/insurance/{{insuranceId}}`
- `DELETE {{baseUrl}}/api/insurance/{{insuranceId}}`

### Folder 11: Technical Visits (5 requests)

- `GET {{baseUrl}}/api/technical-visits` -- query: `?car_id=1`
- `GET {{baseUrl}}/api/technical-visits/{{technicalVisitId}}`
- `POST {{baseUrl}}/api/technical-visits` -- body: `{ "car_id": 1, "visit_date": "2026-04-15", "expiration_date": "2027-04-15", "cost": 500 }`
- `PUT {{baseUrl}}/api/technical-visits/{{technicalVisitId}}`
- `DELETE {{baseUrl}}/api/technical-visits/{{technicalVisitId}}`

### Folder 12: Damage Reports + Images (7 requests)

- `GET {{baseUrl}}/api/damages` -- query: `?resolved=false`
- `GET {{baseUrl}}/api/damages/{{damageReportId}}`
- `POST {{baseUrl}}/api/damages` -- multipart/form-data: `car_id=1`, `description=Test damage`, `estimated_cost=1000`, optional `images` files
- `PUT {{baseUrl}}/api/damages/{{damageReportId}}` -- body: `{ "resolved": true }`
- `POST {{baseUrl}}/api/damages/{{damageReportId}}/images` -- multipart/form-data with `image`
- `DELETE {{baseUrl}}/api/damages/{{damageReportId}}/images/{{damageImageId}}`
- `PATCH {{baseUrl}}/api/damages/{{damageReportId}}/notify`

### Folder 13: Blog Posts (6 requests)

- `GET {{baseUrl}}/api/blog` -- query: `?is_published=true`
- `GET {{baseUrl}}/api/blog/{{blogPostId}}`
- `POST {{baseUrl}}/api/blog` -- body with all bilingual fields (title_fr/ar, slug_fr/ar, content_fr/ar, excerpt, meta, category, tags)
- `PUT {{baseUrl}}/api/blog/{{blogPostId}}`
- `PATCH {{baseUrl}}/api/blog/{{blogPostId}}/publish`
- `DELETE {{baseUrl}}/api/blog/{{blogPostId}}`

### Folder 14: FAQs (5 requests)

- `GET {{baseUrl}}/api/faqs` -- query: `?category=Tarifs`
- `GET {{baseUrl}}/api/faqs/{{faqId}}`
- `POST {{baseUrl}}/api/faqs` -- body: `{ "question_fr": "Test Q?", "question_ar": "سؤال؟", "answer_fr": "Test A", "answer_ar": "جواب", "category": "Tarifs", "sort_order": 99 }`
- `PUT {{baseUrl}}/api/faqs/{{faqId}}`
- `DELETE {{baseUrl}}/api/faqs/{{faqId}}`

### Folder 15: Site Settings (4 requests)

- `GET {{baseUrl}}/api/settings`
- `GET {{baseUrl}}/api/settings/site_name`
- `PUT {{baseUrl}}/api/settings/site_name` -- body: `{ "value_fr": "Wak Cars Updated", "value_ar": "واك كارز محدث" }`
- `POST {{baseUrl}}/api/settings` -- body: `{ "key": "test_setting", "value_fr": "test", "value_ar": "اختبار" }`

### Folder 16: Reports (4 requests)

- `GET {{baseUrl}}/api/reports/revenue` -- query: `?period=monthly`
- `GET {{baseUrl}}/api/reports/utilization`
- `GET {{baseUrl}}/api/reports/reservations`
- `GET {{baseUrl}}/api/reports/export?type=revenue&format=csv&period=monthly`

### Folder 17: Cron (1 request)

- `POST {{baseUrl}}/api/cron/run-jobs` -- header: `X-Cron-Secret: {{cronSecret}}`

---

## Pre-requisite: Fix Admin Password Hashes

The seed data hashes at line 533-535 of `wakcars_schema.sql` appear to be placeholder values. Before any test can run, we need a small Node.js script (`backend/scripts/seed-admin.js`) that:

1. Connects to the DB via Prisma
2. Hashes `Admin@2026!` and `Staff@2026!` with bcrypt factor 12
3. Updates the 3 admin rows with valid hashes

This is a **blocking prerequisite** -- login will fail without it.

---

## Collection-Level Config

- **Authorization**: Set at collection level to `Bearer Token` with value `{{accessToken}}`
- **Pre-request script** (collection level): none needed, each login request auto-saves the token
- **Test scripts on Login request**:

```javascript
if (pm.response.code === 200) {
    const json = pm.response.json();
    pm.environment.set("accessToken", json.data.accessToken);
}
```

- **Test scripts on all requests** (collection level):

```javascript
pm.test("Status is not 500", function () {
    pm.expect(pm.response.code).to.not.equal(500);
});
```

---

## Execution Order

Run the folders in the numbered order above. Within each folder, run requests top-to-bottom. Login must run first to populate `{{accessToken}}`. Create operations should run before get-by-id and update operations that depend on returned IDs.

For IDs returned by create operations, add post-request scripts like:

```javascript
if (pm.response.code === 201) {
    const json = pm.response.json();
    pm.environment.set("newCategoryId", json.data.id);
}
```

