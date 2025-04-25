# ECOA Memory Bank System

This system manages memory bank entries for individuals with hearing disabilities in correctional facilities.

## Features

- Memory Bank Management
- User Authentication and Authorization
- Facility and Unit Management
- Individual Records
- Disability Tracking
- Prompt System
- Audit Logging

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your database:
- Create a PostgreSQL database
- Copy `.env.example` to `.env`
- Update the `DATABASE_URL` in `.env` with your database connection string

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Seed the database:
```bash
npm run seed
```

## Development

1. Start the development server:
```bash
npm run dev
```

## Database Schema

The system includes the following main models:

- `MemoryBank`: Stores memory bank entries for individuals
- `Individual`: Represents persons in the facility
- `Disability`: Tracks different types of disabilities
- `User`: System users (admin, officers, supervisors)
- `Facility`: Correctional facilities
- `Unit`: Housing units within facilities
- `Prompt`: Communication prompts
- `AuditLog`: System audit trail

## Default Users

After seeding, you can log in with these default credentials:

- Admin: username: `admin`, password: `admin123`
- Officer: username: `officer1`, password: `officer123`
- Supervisor: username: `supervisor1`, password: `supervisor123`

**Note:** Change these passwords in production. 