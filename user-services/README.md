# User Management Service

This service handles user registration, authentication, and profile management for the Distributed Parcel Delivery System.

## Features

- User Registration and Authentication (JWT-based)
- Role-based Access Control (Customer, Courier, Admin)
- Courier Profile Management
- Secure Password Hashing (Bcrypt)
- Dockerized deployment

## Tech Stack

- **Framework**: Node.js (TypeScript) + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Access + Refresh Tokens)
- **Container**: Docker

## Architecture

This service follows **Clean Architecture** principles:

- **Domain Layer**: Contains enterprise logic and entities (`src/domain`). It is independent of other layers.
- **Application Layer**: Contains business logic and use cases (`src/application`). It orchestrates data flow between domain and interface adapters.
- **Infrastructure Layer**: Implements interfaces defined in domain/application layers (`src/infrastructure`). Handles external concerns like Database, Auth providers.
- **Interface Layer**: Handles incoming requests and responses (`src/interfaces`). Includes Controllers, Routes, Middleware.

## Environment Variables

See `.env.example` for reference.

| Variable | Description |
|----------|-------------|
| PORT | Port to run the service on |
| DATABASE_URL | Connection string for PostgreSQL |
| JWT_SECRET | Secret key for signing JWTs |
| JWT_ACCESS_EXPIRATION | Expiration time for access tokens |
| JWT_REFRESH_EXPIRATION | Expiration time for refresh tokens |

## How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   Ensure PostgreSQL is running and the database `user_service_db` exists.
   Run the SQL script `../db/init_scripts/01_init_user_db.sql` to initialize tables.
   Or update `.env` with your DB credentials.

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Run in Development Mode**:
   ```bash
   npm run dev
   ```

## How to Run with Docker

The service is integrated into the root `docker-compose.yml`.

1. **Build and Start**:
   From the project root:
   ```bash
   docker-compose up --build
   ```

   This will start the User Service (port 3000) and the User Database (port 5432).

## API Endpoints

- **Auth**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`

- **Users**:
  - `GET /users/me`
  - `PATCH /users/me`
  - `GET /users/:id` (Admin only)

- **Couriers**:
  - `POST /couriers/profile`
  - `PATCH /couriers/availability`
  - `GET /couriers/me`
