# CAMU ECOA App - Detailed Database Schema

## 1. Overview

This document provides a comprehensive database schema design for the CAMU ECOA (Effective Communication for Armstrong) Application. The schema is designed for MySQL 8.0+ and will be managed using Prisma ORM. The database design focuses on:

- Optimized data structure for correctional environment requirements
- Efficient query performance for both online and offline operations
- Proper relationship modeling to maintain data integrity
- Support for audit logging and compliance reporting

## 2. Schema Diagram

Below is the entity relationship diagram (ERD) for the CAMU ECOA database:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     User        │       │    Prompt       │       │   Individual    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ username        │       │ userId          │╾──────╼│ cdcrNumber     │
│ password        │       │ individualId    │       │ firstName       │
│ firstName       │╾──────╼│ promptTypeId   │       │ lastName        │
│ lastName        │       │ status          │       │ housingUnit     │
│ badgeNumber     │       │ signatureData   │       │ facilityId      │
│ role            │       │ notes           │       │ createdAt       │
│ facilityId      │       │ createdAt       │       │ updatedAt       │
│ unitId          │       │ location        │       │ isActive        │
│ createdAt       │       │ deviceId        │       └─────────────────┘
│ updatedAt       │       │ syncedAt        │              ┬
│ lastLoginAt     │       │ updatedAt       │              │
└─────────────────┘       └─────────────────┘              │
        ┬                         ┬                        │
        │                         │                        │
        │                         │                        │
┌───────┴─────────┐      ┌────────┴────────┐      ┌───────┴─────────┐
│    Facility     │      │   PromptType    │      │  IndividualDis- │
├─────────────────┤      ├─────────────────┤      │     ability     │
│ id              │      │ id              │      ├─────────────────┤
│ name            │      │ name            │      │ id              │
│ code            │      │ description     │      │ individualId    │
│ region          │      │ category        │      │ disabilityId    │
│ createdAt       │      │ isActive        │      │ notes           │
│ updatedAt       │      │ createdAt       │      │ createdAt       │
└─────────────────┘      │ updatedAt       │      │ updatedAt       │
        ┬                └─────────────────┘      └─────────────────┘
        │                                                  │
        │                                                  │
┌───────┴─────────┐                             ┌──────────┴────────┐
│     Unit        │                             │    Disability     │
├─────────────────┤                             ├─────────────────┤
│ id              │                             │ id              │
│ name            │                             │ type            │
│ code            │                             │ description     │
│ facilityId      │                             │ code            │
│ createdAt       │                             │ createdAt       │
│ updatedAt       │                             │ updatedAt       │
└─────────────────┘                             └─────────────────┘
```

## 3. Detailed Table Specifications

### 3.1 User

Stores information about system users, including correctional officers and administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| firstName | VARCHAR(100) | NOT NULL | User's first name |
| lastName | VARCHAR(100) | NOT NULL | User's last name |
| badgeNumber | VARCHAR(20) | UNIQUE, NULL | Officer badge number, if applicable |
| role | ENUM | NOT NULL | 'ADMIN', 'SUPERVISOR', 'OFFICER', 'MEDICAL' |
| facilityId | INT | FK, NOT NULL | Reference to Facility table |
| unitId | INT | FK, NULL | Reference to Unit table, if assigned |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |
| lastLoginAt | DATETIME | NULL | Time of last successful login |
| isActive | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether user account is active |
| refreshToken | VARCHAR(255) | NULL | Storage of JWT refresh token |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_user_username (username)
- UNIQUE INDEX idx_user_badge (badgeNumber)
- INDEX idx_user_facility (facilityId)
- INDEX idx_user_unit (unitId)

### 3.2 Individual

Stores information about incarcerated persons with hearing disabilities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| cdcrNumber | VARCHAR(20) | UNIQUE, NOT NULL | CDCR identification number |
| firstName | VARCHAR(100) | NOT NULL | Individual's first name |
| lastName | VARCHAR(100) | NOT NULL | Individual's last name |
| housingUnit | VARCHAR(50) | NOT NULL | Current housing assignment |
| facilityId | INT | FK, NOT NULL | Reference to Facility table |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |
| isActive | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether record is active |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_individual_cdcr (cdcrNumber)
- INDEX idx_individual_facility (facilityId)
- INDEX idx_individual_name (lastName, firstName)
- INDEX idx_individual_housing (housingUnit)

### 3.3 Disability

Stores types of disabilities that can be assigned to individuals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| type | VARCHAR(100) | NOT NULL | Type of disability (e.g., 'HOH', 'Deaf') |
| description | VARCHAR(255) | NULL | Detailed description |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Short code for the disability |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_disability_code (code)

### 3.4 IndividualDisability

Junction table linking individuals to their disabilities (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| individualId | INT | FK, NOT NULL | Reference to Individual table |
| disabilityId | INT | FK, NOT NULL | Reference to Disability table |
| notes | TEXT | NULL | Additional notes about this disability for this individual |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_individual_disability (individualId, disabilityId)
- INDEX idx_disability_individual (disabilityId)

### 3.5 Facility

Stores information about correctional facilities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Facility name |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Facility code |
| region | VARCHAR(50) | NULL | Geographic region |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_facility_code (code)

### 3.6 Unit

Stores information about housing units within facilities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Unit name |
| code | VARCHAR(20) | NOT NULL | Unit code |
| facilityId | INT | FK, NOT NULL | Reference to Facility table |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_unit_facility_code (facilityId, code)
- INDEX idx_unit_facility (facilityId)

### 3.7 PromptType

Stores types of communication prompts that can be delivered.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Prompt name |
| description | VARCHAR(255) | NULL | Detailed description |
| category | VARCHAR(50) | NOT NULL | Category (e.g., 'Yard', 'Meals', 'Medical') |
| isActive | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether prompt type is active |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_prompt_type_category (category)

### 3.8 Prompt

Stores records of communication prompts delivered to individuals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| userId | INT | FK, NOT NULL | Reference to User who delivered prompt |
| individualId | INT | FK, NOT NULL | Reference to Individual who received prompt |
| promptTypeId | INT | FK, NOT NULL | Reference to PromptType |
| status | ENUM | NOT NULL | 'SIGNED', 'REFUSED', 'ATTEMPTED', 'PENDING' |
| signatureData | MEDIUMTEXT | NULL | Base64 encoded signature, if captured |
| notes | TEXT | NULL | Additional notes |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| location | VARCHAR(100) | NOT NULL | Physical location where prompt was delivered |
| deviceId | VARCHAR(100) | NULL | ID of device used for recording |
| syncedAt | DATETIME | NULL | Time when record was synced from offline |
| updatedAt | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_prompt_user (userId)
- INDEX idx_prompt_individual (individualId)
- INDEX idx_prompt_prompt_type (promptTypeId)
- INDEX idx_prompt_status (status)
- INDEX idx_prompt_date (createdAt)

### 3.9 SyncQueue

Stores records pending synchronization when working offline.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| userId | INT | FK, NOT NULL | User who created the record |
| recordType | VARCHAR(50) | NOT NULL | Type of record ('PROMPT', etc.) |
| recordData | JSON | NOT NULL | JSON representation of the record |
| status | ENUM | NOT NULL | 'PENDING', 'COMPLETED', 'FAILED' |
| attemptCount | INT | NOT NULL, DEFAULT 0 | Number of sync attempts |
| errorMessage | TEXT | NULL | Last error message if sync failed |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |
| lastAttemptAt | DATETIME | NULL | Time of last sync attempt |
| completedAt | DATETIME | NULL | Time when successfully synced |

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_sync_user (userId)
- INDEX idx_sync_status (status)
- INDEX idx_sync_date (createdAt)

### 3.10 AuditLog

Tracks all significant system actions for audit purposes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| userId | INT | FK, NULL | User who performed the action (NULL for system actions) |
| action | VARCHAR(100) | NOT NULL | Type of action performed |
| entityType | VARCHAR(50) | NULL | Type of entity affected |
| entityId | INT | NULL | ID of entity affected |
| details | JSON | NULL | Additional details about the action |
| ipAddress | VARCHAR(45) | NULL | IP address of the user |
| userAgent | VARCHAR(255) | NULL | Browser/device information |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_audit_user (userId)
- INDEX idx_audit_action (action)
- INDEX idx_audit_entity (entityType, entityId)
- INDEX idx_audit_date (createdAt)

## 4. Foreign Key Constraints

### 4.1 User Table
- `facilityId` → `Facility(id)` ON DELETE RESTRICT ON UPDATE CASCADE
- `unitId` → `Unit(id)` ON DELETE SET NULL ON UPDATE CASCADE

### 4.2 Individual Table
- `facilityId` → `Facility(id)` ON DELETE RESTRICT ON UPDATE CASCADE

### 4.3 IndividualDisability Table
- `individualId` → `Individual(id)` ON DELETE CASCADE ON UPDATE CASCADE
- `disabilityId` → `Disability(id)` ON DELETE RESTRICT ON UPDATE CASCADE

### 4.4 Unit Table
- `facilityId` → `Facility(id)` ON DELETE CASCADE ON UPDATE CASCADE

### 4.5 Prompt Table
- `userId` → `User(id)` ON DELETE RESTRICT ON UPDATE CASCADE
- `individualId` → `Individual(id)` ON DELETE RESTRICT ON UPDATE CASCADE
- `promptTypeId` → `PromptType(id)` ON DELETE RESTRICT ON UPDATE CASCADE

### 4.6 SyncQueue Table
- `userId` → `User(id)` ON DELETE CASCADE ON UPDATE CASCADE

### 4.7 AuditLog Table
- `userId` → `User(id)` ON DELETE SET NULL ON UPDATE CASCADE

## 5. Prisma Schema

Below is the Prisma schema representation of the database design:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int       @id @default(autoincrement())
  username     String    @unique
  password     String
  firstName    String
  lastName     String
  badgeNumber  String?   @unique
  role         Role      @default(OFFICER)
  facility     Facility  @relation(fields: [facilityId], references: [id])
  facilityId   Int
  unit         Unit?     @relation(fields: [unitId], references: [id])
  unitId       Int?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastLoginAt  DateTime?
  isActive     Boolean   @default(true)
  refreshToken String?
  
  prompts     Prompt[]
  syncQueue   SyncQueue[]
  auditLogs   AuditLog[]
}

model Individual {
  id          Int       @id @default(autoincrement())
  cdcrNumber  String    @unique
  firstName   String
  lastName    String
  housingUnit String
  facility    Facility  @relation(fields: [facilityId], references: [id])
  facilityId  Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  isActive    Boolean   @default(true)
  
  disabilities IndividualDisability[]
  prompts      Prompt[]
}

model Disability {
  id          Int       @id @default(autoincrement())
  type        String
  description String?
  code        String    @unique
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  individuals IndividualDisability[]
}

model IndividualDisability {
  id           Int        @id @default(autoincrement())
  individual   Individual @relation(fields: [individualId], references: [id], onDelete: Cascade)
  individualId Int
  disability   Disability @relation(fields: [disabilityId], references: [id])
  disabilityId Int
  notes        String?    @db.Text
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@unique([individualId, disabilityId])
}

model Facility {
  id        Int       @id @default(autoincrement())
  name      String
  code      String    @unique
  region    String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  users       User[]
  units       Unit[]
  individuals Individual[]
}

model Unit {
  id         Int      @id @default(autoincrement())
  name       String
  code       String
  facility   Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  facilityId Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  users User[]
  
  @@unique([facilityId, code])
}

model PromptType {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  category    String
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  prompts Prompt[]
}

model Prompt {
  id            Int         @id @default(autoincrement())
  user          User        @relation(fields: [userId], references: [id])
  userId        Int
  individual    Individual  @relation(fields: [individualId], references: [id])
  individualId  Int
  promptType    PromptType  @relation(fields: [promptTypeId], references: [id])
  promptTypeId  Int
  status        PromptStatus
  signatureData String?     @db.MediumText
  notes         String?     @db.Text
  createdAt     DateTime    @default(now())
  location      String
  deviceId      String?
  syncedAt      DateTime?
  updatedAt     DateTime    @updatedAt
}

model SyncQueue {
  id            Int       @id @default(autoincrement())
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        Int
  recordType    String
  recordData    Json
  status        SyncStatus @default(PENDING)
  attemptCount  Int       @default(0)
  errorMessage  String?   @db.Text
  createdAt     DateTime  @default(now())
  lastAttemptAt DateTime?
  completedAt   DateTime?
}

model AuditLog {
  id         Int       @id @default(autoincrement())
  user       User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId     Int?
  action     String
  entityType String?
  entityId   Int?
  details    Json?
  ipAddress  String?   @db.VarChar(45)
  userAgent  String?
  createdAt  DateTime  @default(now())
}

enum Role {
  ADMIN
  SUPERVISOR
  OFFICER
  MEDICAL
}

enum PromptStatus {
  SIGNED
  REFUSED
  ATTEMPTED
  PENDING
}

enum SyncStatus {
  PENDING
  COMPLETED
  FAILED
}
```

## 6. Indexing Strategy

The database schema includes strategic indexes to optimize the most common query patterns:

1. **Primary Keys**: All tables have integer auto-increment primary keys for efficient joins.

2. **Unique Constraints**: Applied to business-level unique identifiers like username, badge number, and CDCR number.

3. **Foreign Key Indexes**: All foreign key columns are indexed to improve join performance.

4. **Composite Indexes**: Used for common query patterns, such as searching individuals by name.

5. **Status and Date Indexes**: Applied to fields commonly used in filtering, such as prompt status and creation date.

## 7. Data Migration and Seeding

Initial database setup will include:

1. **System Configuration Data**:
   - Initial admin user(s)
   - Disability types and codes
   - Facilities and units
   - Standard prompt types by category

2. **Test Data (Development Environment Only)**:
   - Sample HOH individuals
   - Sample prompts with various statuses
   - Sample users with different roles

## 8. Data Integrity Rules

Beyond foreign key constraints, the following business rules should be enforced at the application level:

1. Individuals can only be assigned to housing units within their assigned facility.
2. Users can only deliver prompts to individuals within their assigned facility.
3. Prompt status cannot be changed after it has been set to SIGNED, REFUSED, or ATTEMPTED.
4. When a user's account is deactivated (isActive = false), they should not be able to login.
5. Prompts created in offline mode should be marked with syncedAt when synchronized to the server.

## 9. Performance Considerations

For optimal database performance:

1. **Partitioning**: Consider partitioning the Prompt table by month if the volume of data becomes large.
2. **Archiving Strategy**: Implement an archiving strategy for prompt data older than a specified time period.
3. **Indexing Reviews**: Regularly review index usage and query performance, adjusting as needed.
4. **Offline Data Management**: Implement client-side data purging after successful synchronization.

## 10. Security Considerations

The database design incorporates security best practices:

1. **Password Storage**: Passwords are stored as bcrypt hashes, never in plain text.
2. **Audit Logging**: All significant user actions are logged for accountability.
3. **Sensitive Data Handling**: Personal information is protected and access is controlled through application logic.
4. **Refresh Token Management**: Tokens are stored in the database and rotated regularly.
