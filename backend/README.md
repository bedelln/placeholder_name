# SideQuesters Backend

Backend foundation for the SideQuesters mobile app. This backend covers the 25% milestone only:

- runnable Express server
- PostgreSQL connected through Prisma
- `User` model
- register/login flow
- JWT-protected `GET /api/users/me`

No friends, groups, challenges, verification, points, or leaderboard features are included.

## Project Structure

```text
backend/
  prisma/
    schema.prisma
  src/
    config/        environment loading and validation
    controllers/   thin HTTP handlers
    lib/           Prisma client and JWT helpers
    middleware/    auth, errors, 404 handling
    routes/        Express route definitions
    services/      business logic for auth and users
    types/         Express request typing
    utils/         shared helpers
    app.ts         Express app setup
    server.ts      server entry point
```

## Install

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

## Environment Variables

Fill in these values in `.env`:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sidequesters?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
```

`JWT_SECRET` should be a long random string, at least 32 characters.

## Create the Database

Create a PostgreSQL database named `sidequesters`.

Example using `psql`:

```sql
CREATE DATABASE sidequesters;
```

Then update `DATABASE_URL` in `.env` if your username, password, host, or port are different.

## Prisma Setup

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create and apply the first migration:

```bash
npm run prisma:migrate -- --name init
```

## Run the Server

For development:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

`GET /health`

### Register

`POST /api/auth/register`

Example:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"quester1\",\"email\":\"quester1@example.com\",\"password\":\"StrongPass123\"}"
```

### Login

`POST /api/auth/login`

Login accepts either email or username through `identifier`.

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"quester1@example.com\",\"password\":\"StrongPass123\"}"
```

### Current User

`GET /api/users/me`

```bash
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

- Passwords are hashed with `bcrypt`.
- Password hashes are never returned in API responses.
- Input validation is handled with `zod`.
- Auth uses signed JWTs.
