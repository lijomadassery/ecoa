# CAMU ECOA (Effective Communication for Armstrong) Application

A comprehensive system for managing and tracking communication with individuals with hearing disabilities in correctional facilities.

## Features

- User Management with Role-Based Access Control (Admin, Supervisor, Officer, Medical)
- Facility and Unit Management
- Individual Records with Disability Tracking
- Communication Prompt System with Offline Support
- Digital Signature Capture
- Comprehensive Audit Logging
- Offline-First Architecture with Sync Queue
- Real-time Data Synchronization

## Project Structure

```
ecoa/
├── backend/                 # Backend application
│   ├── src/                # Source code
│   ├── prisma/             # Database schema and migrations
│   ├── scripts/            # Utility scripts
│   ├── dist/               # Compiled code
│   └── package.json        # Backend dependencies
│
├── frontend/               # Frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── index.html         # Entry HTML file
│   └── package.json       # Frontend dependencies
│
├── public/                # Shared static assets
├── memory-bank/          # Project documentation
├── node_modules/         # Root level dependencies
├── .env.example          # Example environment variables
├── package.json          # Root level project configuration
└── README.md             # Project documentation

Additional Documentation:
- db_schema_document.md   # Detailed database schema
- tech_context_document.md # Technical context
- setup_guide.md         # Detailed setup instructions
- ecoa_prd_document.md   # Product requirements
```

## Prerequisites

- Node.js (v16 or higher)
- MySQL 8.0 or higher
- npm or yarn package manager

## Installation

All commands below should be run from the specified directories. The root directory is referred to as `ecoa/`.

1. Clone the repository and navigate to project directory:
```bash
# Run from where you want to create the project
git clone [repository-url]
cd ecoa
```

2. Install dependencies:
```bash
# Install root dependencies
# Run from: ecoa/
npm install

# Install backend dependencies
# Run from: ecoa/backend
cd backend && npm install

# Install frontend dependencies
# Run from: ecoa/frontend
cd ../frontend && npm install
```

3. Set up your environment:
```bash
# Run from: ecoa/backend
# Copy the example environment file
cp .env.example .env

# Open .env in your preferred editor and update these variables:
# DATABASE_URL="mysql://user:password@localhost:3306/ecoa_db"
# JWT_SECRET="your-secure-secret-key"
# APP_URL="http://localhost:3000"
```

4. Database Setup:
```bash
# Run from any directory with MySQL client access
mysql -u root -p -e "CREATE DATABASE ecoa_db;"

# The following commands must be run from: ecoa/backend
cd backend

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Seed the database with initial data
npm run prisma:seed
```

## Development

1. Start the development servers:
```bash
# Start backend development server
# Run from: ecoa/backend
cd backend && npm run dev

# In a new terminal, start frontend development server
# Run from: ecoa/frontend
cd frontend && npm run dev
```

2. Access the application:
- Frontend: http://localhost:5173 (or the port shown in your terminal)
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Database Schema

The application uses a MySQL database with the following core models:

- `User`: System users with role-based access
- `Individual`: Persons with hearing disabilities
- `Disability`: Types of disabilities and their codes
- `IndividualDisability`: Junction table for individual-disability relationships
- `Facility`: Correctional facilities
- `Unit`: Housing units within facilities
- `PromptType`: Types of communication prompts
- `Prompt`: Communication prompt records with signature data
- `SyncQueue`: Offline synchronization queue
- `AuditLog`: Comprehensive system audit trail

For detailed schema information, see `prisma/schema.prisma` or `db_schema_document.md`.

## Default Users

After seeding, you can log in with these default credentials:

- Admin:
  - Username: `admin`
  - Password: `admin123!`
  - Role: ADMIN

- Supervisor:
  - Username: `supervisor1`
  - Password: `supervisor123!`
  - Role: SUPERVISOR

- Officer:
  - Username: `officer1`
  - Password: `officer123!`
  - Role: OFFICER

**Important:** Change these passwords immediately in production environments.

## Offline Support

The application supports offline operations:
1. Data is cached locally using IndexedDB
2. Changes are queued in the SyncQueue
3. Automatic synchronization when connection is restored
4. Conflict resolution based on timestamp and business rules

## Security Features

- Password hashing using bcrypt
- JWT-based authentication with refresh tokens
- Role-based access control
- Comprehensive audit logging
- Data encryption at rest
- HTTPS enforcement in production

## Production Deployment

All commands below should be run from their respective directories.

1. Build the applications:
```bash
# Build backend
# Run from: ecoa/backend
cd backend && npm run build

# Build frontend
# Run from: ecoa/frontend
cd frontend && npm run build
```

2. Set production environment variables:
```bash
# Backend environment variables (in ecoa/backend/.env):
NODE_ENV=production
DATABASE_URL=mysql://user:password@your-production-db:3306/ecoa_db
JWT_SECRET=your-secure-secret-key
APP_URL=https://your-production-domain.com

# Optional backend environment variables:
REDIS_URL=redis://your-redis-server:6379
SENTRY_DSN=your-sentry-dsn

# Frontend environment variables (in ecoa/frontend/.env):
VITE_API_URL=https://api.your-production-domain.com
```

3. Start the production servers:
```bash
# Start backend production server
# Run from: ecoa/backend
cd backend && npm start

# For frontend, deploy the built files from frontend/dist to your web server
```

## Scripts

Common scripts available:

Backend scripts (run from `ecoa/backend`):
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run test            # Run tests
npm run lint            # Run linter
npm run format          # Format code
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:seed     # Seed the database with initial data
```

Frontend scripts (run from `ecoa/frontend`):
```bash
npm run dev          # Start development server
npm run build       # Build for production
npm run preview     # Preview production build locally
npm run test        # Run tests
npm run lint        # Run linter
npm run format      # Format code
```

## Contributing

All commands below should be run from the project root directory (`ecoa/`).

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and run tests:
```bash
# Test backend
cd backend && npm test

# Test frontend
cd frontend && npm test
```

3. Format and lint your code:
```bash
# Format and lint backend
cd backend
npm run format
npm run lint

# Format and lint frontend
cd frontend
npm run format
npm run lint
```

4. Submit a pull request through GitHub

## License

[License Type] - See LICENSE file for details

## Support

For support, please contact [support contact information] # Trigger CI/CD
