# Course Catalog API

REST API untuk katalog kursus online menggunakan Node.js, Express, dan Prisma.

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT for Authentication
- bcryptjs for Password Hashing

## Setup

### Install dependencies

```bash
npm install
```

### Setup environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### Run Prisma migration

```bash
npx prisma migrate dev --name init
```

### Seed database

```bash
node prisma/seed.js
```

### Start server

```bash
npm run dev
```

## Default Admin Account

- **Email:** admin@course.com
- **Password:** admin123

## API Documentation

See Postman collection for full API documentation.