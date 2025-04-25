# CAMU ECOA App - Database Setup Guide

This guide will walk you through setting up the database for the CAMU ECOA App using either raw SQL or Prisma ORM.

## Prerequisites

- MySQL 8.0+ installed and running
- Node.js and npm installed (if using Prisma)
- Access to a MySQL client (MySQL Workbench, CLI, etc.)

## Option 1: Setup Using Raw SQL

This approach uses the SQL script directly for database creation.

### Step 1: Connect to MySQL Server

```bash
mysql -u root -p
```

Enter your MySQL root password when prompted.

### Step 2: Run the SQL Script

You can run the SQL script in two ways:

**Option A: Directly from the MySQL client:**

```sql
source /path/to/schema_creation_script.sql
```

**Option B: From the command line:**

```bash
mysql -u root -p < /path/to/schema_creation_script.sql
```

This will create the database, tables, and insert the initial seed data.

### Step 3: Verify the Setup

```sql
USE camu_ecoa_db;
SHOW TABLES;
SELECT * FROM User;
```

You should see the tables created and initial data populated.

## Option 2: Setup Using Prisma ORM

This approach uses Prisma ORM for database management, which is the recommended approach for the Vue 3 application.

### Step 1: Create a New Project (if not already set up)

```bash
mkdir camu-ecoa-app
cd camu-ecoa-app
npm init -y
npm install prisma @prisma/client
npx prisma init
```

### Step 2: Configure Database Connection

Edit the `.env` file in your project root:

```
DATABASE_URL="mysql://username:password@localhost:3306/camu_ecoa_db"
```

Replace `username` and `password` with your MySQL credentials.

### Step 3: Add the Prisma Schema

Copy the Prisma schema from `prisma_schema.prisma` into your project's `prisma/schema.prisma` file.

### Step 4: Create the Database

First, make sure you've created the database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS camu_ecoa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 5: Run Prisma Migration

Generate and run the migration:

```bash
npx prisma migrate dev --name init
```

This command will:
- Create all tables based on your Prisma schema
- Generate the Prisma Client

### Step 6: Seed the Database

1. Create a `prisma/seed.ts` file and copy the seed script from the `prisma_seed_script.ts` file.

2. Add the seed script to your `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

3. Install required dependencies:

```bash
npm install ts-node typescript @types/node bcryptjs @types/bcryptjs --save-dev
```

4. Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

5. Run the seed script:

```bash
npx prisma db seed
```

### Step 7: Verify the Setup

You can use Prisma Studio to verify the database setup:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can browse the database.

## Database Connection in the Vue 3 Application

To connect to the database from your Vue 3 application, you'll need to set up an Express.js backend that uses Prisma Client.

### Basic Express.js Backend Setup

1. Install dependencies:

```bash
npm install express cors dotenv
npm install --save-dev @types/express @types/cors
```

2. Create a basic server file (`src/server/index.ts`):

```typescript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Example route to get all individuals
app.get('/api/individuals', async (req, res) => {
  try {
    const individuals = await prisma.individual.findMany({
      where: { isActive: true },
      include: {
        disabilities: {
          include: {
            disability: true,
          },
        },
      },
    });
    res.json(individuals);
  } catch (error) {
    console.error('Error fetching individuals:', error);
    res.status(500).json({ error: 'Failed to fetch individuals' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

3. Build and run the server:

```bash
tsc src/server/index.ts
node src/server/index.js
```

## Database Backup and Maintenance

### Taking Backups

```bash
mysqldump -u root -p camu_ecoa_db > backup_$(date +%Y%m%d).sql
```

### Restoring from Backup

```bash
mysql -u root -p camu_ecoa_db < backup_filename.sql
```

### Regular Maintenance Tasks

1. **Check and Optimize Tables:**

```sql
USE camu_ecoa_db;
SHOW TABLE STATUS;
OPTIMIZE TABLE User, Individual, Prompt;
```

2. **Monitor Storage Size:**

```sql
SELECT table_name, table_rows, data_length, index_length,
  round(((data_length + index_length) / 1024 / 1024),2) "Size in MB"
FROM information_schema.TABLES
WHERE table_schema = "camu_ecoa_db"
ORDER BY (data_length + index_length) DESC;
```

## Best Practices for Production

1. **Create a Dedicated Database User:**

```sql
CREATE USER 'camu_app'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON camu_ecoa_db.* TO 'camu_app'@'localhost';
FLUSH PRIVILEGES;
```

2. **Enable SSL for Database Connection:**

Update your DATABASE_URL in .env:

```
DATABASE_URL="mysql://username:password@localhost:3306/camu_ecoa_db?sslmode=required"
```

3. **Regular Backups:**

Set up automated daily backups using cron:

```bash
0 2 * * * mysqldump -u root -p your_password camu_ecoa_db > /path/to/backups/backup_$(date +\%Y\%m\%d).sql
```

4. **Monitoring:**

Set up monitoring for database performance using tools like MySQL Enterprise Monitor or Prometheus with mysqld_exporter.

## Troubleshooting Common Issues

### Connection Issues

If you encounter connection issues:

1. Verify MySQL is running:
```bash
sudo systemctl status mysql
```

2. Check that the user has proper permissions:
```sql
SHOW GRANTS FOR 'camu_app'@'localhost';
```

3. Verify connection string format in .env file

### Migration Issues

If Prisma migrations fail:

1. Check for syntax errors in schema.prisma
2. Ensure your MySQL version is compatible (8.0+)
3. Try resetting the database if in development:
```bash
npx prisma migrate reset
```

### Performance Issues

If you encounter performance issues:

1. Check for missing indexes on frequently queried fields
2. Use EXPLAIN to analyze query performance:
```sql
EXPLAIN SELECT * FROM Prompt WHERE individualId = 1;
```
3. Consider adding additional indexes based on query patterns
