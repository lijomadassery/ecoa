-- CAMU ECOA App - Schema Creation Script
-- This script creates the database schema for the CAMU ECOA application

-- Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS camu_ecoa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE camu_ecoa_db;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create enum tables (since MySQL doesn't support enum types in the same way Prisma does)
-- We'll use these as reference tables

-- Roles enum table
CREATE TABLE IF NOT EXISTS Role (
    id VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100) NOT NULL
);

-- PromptStatus enum table
CREATE TABLE IF NOT EXISTS PromptStatus (
    id VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100) NOT NULL
);

-- SyncStatus enum table
CREATE TABLE IF NOT EXISTS SyncStatus (
    id VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100) NOT NULL
);

-- Insert enum values
INSERT INTO Role (id, description) VALUES 
    ('ADMIN', 'System administrator with full access'),
    ('SUPERVISOR', 'Supervisor with reporting and oversight capabilities'),
    ('OFFICER', 'Correctional officer with prompt delivery capabilities'),
    ('MEDICAL', 'Medical staff with specialized access');

INSERT INTO PromptStatus (id, description) VALUES
    ('SIGNED', 'Prompt was delivered and signed by the individual'),
    ('REFUSED', 'Individual refused to sign the prompt'),
    ('ATTEMPTED', 'Attempt was made to deliver prompt but was unsuccessful'),
    ('PENDING', 'Prompt is pending delivery or confirmation');

INSERT INTO SyncStatus (id, description) VALUES
    ('PENDING', 'Record is pending synchronization'),
    ('COMPLETED', 'Record has been successfully synchronized'),
    ('FAILED', 'Synchronization attempt failed');

-- Create Facility table
CREATE TABLE IF NOT EXISTS Facility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    region VARCHAR(50),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uc_facility_code UNIQUE (code)
);

-- Create Unit table
CREATE TABLE IF NOT EXISTS Unit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    facilityId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uc_unit_facility_code UNIQUE (facilityId, code),
    CONSTRAINT fk_unit_facility FOREIGN KEY (facilityId)
        REFERENCES Facility (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create User table
CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    badgeNumber VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    facilityId INT NOT NULL,
    unitId INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastLoginAt DATETIME,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    refreshToken VARCHAR(255),
    CONSTRAINT uc_user_username UNIQUE (username),
    CONSTRAINT uc_user_badge UNIQUE (badgeNumber),
    CONSTRAINT fk_user_role FOREIGN KEY (role)
        REFERENCES Role (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_facility FOREIGN KEY (facilityId)
        REFERENCES Facility (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_unit FOREIGN KEY (unitId)
        REFERENCES Unit (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create index on User table
CREATE INDEX idx_user_facility ON User (facilityId);
CREATE INDEX idx_user_unit ON User (unitId);
CREATE INDEX idx_user_name ON User (lastName, firstName);

-- Create Individual table
CREATE TABLE IF NOT EXISTS Individual (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cdcrNumber VARCHAR(20) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    housingUnit VARCHAR(50) NOT NULL,
    facilityId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uc_individual_cdcr UNIQUE (cdcrNumber),
    CONSTRAINT fk_individual_facility FOREIGN KEY (facilityId)
        REFERENCES Facility (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on Individual table
CREATE INDEX idx_individual_facility ON Individual (facilityId);
CREATE INDEX idx_individual_name ON Individual (lastName, firstName);
CREATE INDEX idx_individual_housing ON Individual (housingUnit);

-- Create Disability table
CREATE TABLE IF NOT EXISTS Disability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    code VARCHAR(20) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uc_disability_code UNIQUE (code)
);

-- Create IndividualDisability junction table
CREATE TABLE IF NOT EXISTS IndividualDisability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    individualId INT NOT NULL,
    disabilityId INT NOT NULL,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uc_individual_disability UNIQUE (individualId, disabilityId),
    CONSTRAINT fk_individualdisability_individual FOREIGN KEY (individualId)
        REFERENCES Individual (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_individualdisability_disability FOREIGN KEY (disabilityId)
        REFERENCES Disability (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on IndividualDisability table
CREATE INDEX idx_disability_individual ON IndividualDisability (disabilityId);

-- Create PromptType table
CREATE TABLE IF NOT EXISTS PromptType (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on PromptType table
CREATE INDEX idx_prompt_type_category ON PromptType (category);

-- Create Prompt table
CREATE TABLE IF NOT EXISTS Prompt (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    individualId INT NOT NULL,
    promptTypeId INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    signatureData MEDIUMTEXT,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100) NOT NULL,
    deviceId VARCHAR(100),
    syncedAt DATETIME,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prompt_user FOREIGN KEY (userId)
        REFERENCES User (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prompt_individual FOREIGN KEY (individualId)
        REFERENCES Individual (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prompt_prompttype FOREIGN KEY (promptTypeId)
        REFERENCES PromptType (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prompt_status FOREIGN KEY (status)
        REFERENCES PromptStatus (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on Prompt table
CREATE INDEX idx_prompt_user ON Prompt (userId);
CREATE INDEX idx_prompt_individual ON Prompt (individualId);
CREATE INDEX idx_prompt_prompt_type ON Prompt (promptTypeId);
CREATE INDEX idx_prompt_status ON Prompt (status);
CREATE INDEX idx_prompt_date ON Prompt (createdAt);

-- Create SyncQueue table
CREATE TABLE IF NOT EXISTS SyncQueue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    recordType VARCHAR(50) NOT NULL,
    recordData JSON NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attemptCount INT NOT NULL DEFAULT 0,
    errorMessage TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastAttemptAt DATETIME,
    completedAt DATETIME,
    CONSTRAINT fk_syncqueue_user FOREIGN KEY (userId)
        REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_syncqueue_status FOREIGN KEY (status)
        REFERENCES SyncStatus (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on SyncQueue table
CREATE INDEX idx_sync_user ON SyncQueue (userId);
CREATE INDEX idx_sync_status ON SyncQueue (status);
CREATE INDEX idx_sync_date ON SyncQueue (createdAt);

-- Create AuditLog table
CREATE TABLE IF NOT EXISTS AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    action VARCHAR(100) NOT NULL,
    entityType VARCHAR(50),
    entityId INT,
    details JSON,
    ipAddress VARCHAR(45),
    userAgent VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditlog_user FOREIGN KEY (userId)
        REFERENCES User (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes on AuditLog table
CREATE INDEX idx_audit_user ON AuditLog (userId);
CREATE INDEX idx_audit_action ON AuditLog (action);
CREATE INDEX idx_audit_entity ON AuditLog (entityType, entityId);
CREATE INDEX idx_audit_date ON AuditLog (createdAt);

-- Insert initial data for testing

-- Insert sample facilities
INSERT INTO Facility (name, code, region) VALUES
    ('San Quentin State Prison', 'SQ', 'Northern California'),
    ('Folsom State Prison', 'FSP', 'Northern California'),
    ('California State Prison, Sacramento', 'SAC', 'Northern California');

-- Insert sample units
INSERT INTO Unit (name, code, facilityId) VALUES
    ('Building A', 'A', 1),
    ('Building B', 'B', 1),
    ('Building C', 'C', 1),
    ('North Block', 'NB', 2),
    ('South Block', 'SB', 2);

-- Insert admin user (password is hashed version of 'admin123')
INSERT INTO User (username, password, firstName, lastName, badgeNumber, role, facilityId, unitId, isActive) VALUES
    ('admin', '$2a$10$xVLXqE.QaRBITgB5Hv/tG.JKJg0HWYvFKyeBQOFd.0HGrS6jp.YEO', 'System', 'Administrator', 'ADMIN001', 'ADMIN', 1, NULL, TRUE);

-- Insert sample officer users (password is hashed version of 'officer123')
INSERT INTO User (username, password, firstName, lastName, badgeNumber, role, facilityId, unitId, isActive) VALUES
    ('officer1', '$2a$10$62yxZ1JYwj8y.ZQR0Y5NHu0ChMY3XgSOwX.hpxk1d0nvOjqXMFLvK', 'John', 'Smith', 'CO12345', 'OFFICER', 1, 1, TRUE),
    ('officer2', '$2a$10$62yxZ1JYwj8y.ZQR0Y5NHu0ChMY3XgSOwX.hpxk1d0nvOjqXMFLvK', 'Jane', 'Doe', 'CO23456', 'OFFICER', 1, 2, TRUE),
    ('officer3', '$2a$10$62yxZ1JYwj8y.ZQR0Y5NHu0ChMY3XgSOwX.hpxk1d0nvOjqXMFLvK', 'Robert', 'Johnson', 'CO34567', 'OFFICER', 2, 4, TRUE);

-- Insert sample disabilities
INSERT INTO Disability (type, description, code) VALUES
    ('Hard of Hearing', 'Partial hearing loss requiring accommodations', 'HOH'),
    ('Deaf', 'Complete hearing loss', 'DEAF'),
    ('Hearing Aid', 'Uses hearing aid device', 'HAID');

-- Insert sample individuals (HOH persons)
INSERT INTO Individual (cdcrNumber, firstName, lastName, housingUnit, facilityId, isActive) VALUES
    ('AZ1234', 'John', 'Doe', 'A-202', 1, TRUE),
    ('BK2345', 'Richard', 'Smith', 'A-105', 1, TRUE),
    ('CL3456', 'Michael', 'Jones', 'B-310', 1, TRUE),
    ('DM4567', 'James', 'Wilson', 'B-115', 1, TRUE),
    ('EN5678', 'Robert', 'Brown', 'NB-205', 2, TRUE),
    ('FO6789', 'William', 'Davis', 'NB-302', 2, TRUE);

-- Assign disabilities to individuals
INSERT INTO IndividualDisability (individualId, disabilityId, notes) VALUES
    (1, 1, 'Moderate hearing loss in left ear'),
    (2, 1, 'Mild to moderate hearing loss in both ears'),
    (3, 1, 'Severe hearing loss in right ear'),
    (3, 3, 'Uses hearing aid in right ear'),
    (4, 1, 'Moderate hearing loss in both ears'),
    (5, 2, 'Complete hearing loss'),
    (6, 1, 'Progressive hearing loss');

-- Insert sample prompt types
INSERT INTO PromptType (name, description, category) VALUES
    ('Yard Time', 'Notification of yard time availability', 'Yard'),
    ('Breakfast', 'Notification of breakfast meal time', 'Meals'),
    ('Lunch', 'Notification of lunch meal time', 'Meals'),
    ('Dinner', 'Notification of dinner meal time', 'Meals'),
    ('Medical Appointment', 'Notification of scheduled medical appointment', 'Medical'),
    ('Medication Distribution', 'Notification of medication distribution time', 'Medical'),
    ('Visitor Arrival', 'Notification of visitor arrival', 'Visits'),
    ('Count Time', 'Notification of mandatory count time', 'Security'),
    ('Program Activity', 'Notification of scheduled program activity', 'Programs');

-- Insert sample prompts
INSERT INTO Prompt (userId, individualId, promptTypeId, status, notes, location, deviceId) VALUES
    (2, 1, 1, 'SIGNED', 'Individual acknowledged prompt', 'Building A', 'TABLET-001'),
    (2, 2, 3, 'REFUSED', 'Individual refused to acknowledge prompt', 'Building A', 'TABLET-001'),
    (3, 3, 6, 'ATTEMPTED', 'Individual was asleep, will attempt again later', 'Building B', 'TABLET-002'),
    (4, 5, 4, 'SIGNED', 'Prompt delivered successfully', 'North Block', 'TABLET-003'),
    (4, 6, 5, 'SIGNED', 'Individual needed clarification on appointment time', 'North Block', 'TABLET-003');

-- Create database users and grant privileges (adjust as needed for your environment)
-- CREATE USER 'camu_app'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON camu_ecoa_db.* TO 'camu_app'@'localhost';
-- CREATE USER 'camu_admin'@'localhost' IDENTIFIED BY 'admin_password_here';
-- GRANT ALL PRIVILEGES ON camu_ecoa_db.* TO 'camu_admin'@'localhost';
-- FLUSH PRIVILEGES;

-- End of schema creation script
