-- This is an empty migration.

-- Rename the table
RENAME TABLE `MemoryBank` TO `CommunicationNote`;

-- Update foreign key constraints and indexes
ALTER TABLE `CommunicationNote` 
RENAME INDEX `MemoryBank_individualId_idx` TO `CommunicationNote_individualId_idx`,
RENAME INDEX `MemoryBank_createdById_idx` TO `CommunicationNote_createdById_idx`,
RENAME INDEX `MemoryBank_facilityId_idx` TO `CommunicationNote_facilityId_idx`,
RENAME INDEX `MemoryBank_unitId_idx` TO `CommunicationNote_unitId_idx`,
RENAME INDEX `MemoryBank_updatedById_fkey` TO `CommunicationNote_updatedById_fkey`;