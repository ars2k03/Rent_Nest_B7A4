# RentNest 🏠
**"Find & List Rental Properties with Ease"**

---

## Project Overview

RentNest is a backend API for a rental property marketplace. Landlords can list properties, manage availability, and approve or reject rental requests. Tenants can browse listings, submit rental requests, pay rent, and leave reviews. Admins oversee the entire platform, managing users and moderating content.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Payments | Stripe + SSLCommerz |
| Deployment | Render |

---

## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Tenant** | Users looking for rental properties | Browse listings, submit rental requests, make payments, leave reviews, manage profile |
| **Landlord** | Property owners who list rentals | Create/manage listings, approve/reject requests, complete active rentals |
| **Admin** | Platform moderators | Manage all users, oversee all listings & requests, manage categories |

> Users select their role (`TENANT` or `LANDLORD`) during registration. Admin accounts are seeded.

---

## API Response Format

Every endpoint returns a consistent shape:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "errorDetails": null,
  "data": {}
}
```

Validation and server errors also include `errorDetails`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Stripe test keys (optional for local payment testing)

### Installation

```bash
git clone <repository-url>
cd B7A4
npm install
cp .env.example .env
```

Update `.env` with your database and JWT credentials.

### Database Setup

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### Run Locally

```bash
npm run dev
```

Server starts at `http://localhost:8000`.

### Production Build

```bash
npm run build
npm start
```

---

## Seeded Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentnest.com | Admin@12345 |
| Landlord | landlord@rentnest.com | Landlord@12345 |
| Tenant | tenant@rentnest.com | Tenant@12345 |

> `isDeleted: true` is used as the ban flag for admin user moderation.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (default: 8000) |
| `APP_URL` | Public API URL for payment callbacks |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CORS_ORIGIN` | Comma-separated allowed origins for CORS |

---

## API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| PATCH | `/api/auth/me` | Authenticated |

### Properties (Public)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/properties` | Public |
| GET | `/api/properties/:id` | Public |
| GET | `/api/categories` | Public |

### Landlord Management
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/landlord/properties` | Landlord |
| PUT | `/api/landlord/properties/:id` | Landlord |
| DELETE | `/api/landlord/properties/:id` | Landlord |
| GET | `/api/landlord/requests` | Landlord |
| PATCH | `/api/landlord/requests/:id` | Landlord |

### Rental Requests
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/rentals` | Tenant |
| GET | `/api/rentals` | Tenant |
| GET | `/api/rentals/:id` | Tenant / Landlord / Admin |

### Payments
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/payments/create` | Tenant |
| POST | `/api/payments/confirm` | Tenant |
| GET | `/api/payments` | Tenant |
| GET | `/api/payments/:id` | Tenant / Admin |
| POST | `/api/payments/webhook/stripe` | Stripe |
| GET | `/api/payments/sslcommerz/callback` | Public callback |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/reviews` | Tenant |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/properties` | Admin |
| GET | `/api/admin/rentals` | Admin |
| POST | `/api/categories` | Admin |
| PATCH | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Query Support

Properties support filtering by `location`, `search`, `minPrice`, `maxPrice`, `categoryId`, `amenities`, `isAvailable`, plus `page` and `limit`.

List endpoints across rentals, payments, and admin modules support pagination and role/status filters.

---

## Rental Workflow

```
PENDING -> APPROVED -> PAYMENT -> ACTIVE -> COMPLETED -> REVIEW
```

1. Tenant submits a rental request (`PENDING`)
2. Landlord approves or rejects the request
3. Tenant creates and confirms payment for approved requests
4. Rental becomes `ACTIVE` after successful payment
5. Landlord marks rental as `COMPLETED`
6. Tenant leaves a review for completed rentals

---

## Postman Collection

Import `postman/RentNest.postman_collection.json` into Postman.

Set collection variables:
- `baseUrl`
- `tenantToken`
- `landlordToken`
- `adminToken`

Login requests return JWT tokens in `data.token`.

---

## Deployment (Render)

1. Push the repository to GitHub
2. Create a new Web Service on Render
3. Use `render.yaml` or configure manually:
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run db:migrate && npm start`
4. Add environment variables from `.env.example`
5. Run `npm run seed` once against the production database

---

## Project Structure

```
src/
  middlewares/     # auth, validation, error handling
  modules/         # feature modules (auth, property, rental, etc.)
  router/          # auth routes
  validators/      # Zod schemas
  utils/           # helpers (JWT, pagination, responses)
  lib/             # Prisma client
  server.ts
prisma/
  schema.prisma
  seed.ts
  migrations/
postman/
  RentNest.postman_collection.json
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Seed database with demo data |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Apply migrations |

---

## License

ISC
