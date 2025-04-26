-- DropForeignKey
ALTER TABLE `CommunicationNote` DROP FOREIGN KEY `MemoryBank_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `CommunicationNote` DROP FOREIGN KEY `MemoryBank_facilityId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunicationNote` DROP FOREIGN KEY `MemoryBank_individualId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunicationNote` DROP FOREIGN KEY `MemoryBank_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunicationNote` DROP FOREIGN KEY `MemoryBank_updatedById_fkey`;

-- AddForeignKey
ALTER TABLE `CommunicationNote` ADD CONSTRAINT `CommunicationNote_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationNote` ADD CONSTRAINT `CommunicationNote_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facility`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationNote` ADD CONSTRAINT `CommunicationNote_individualId_fkey` FOREIGN KEY (`individualId`) REFERENCES `Individual`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationNote` ADD CONSTRAINT `CommunicationNote_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationNote` ADD CONSTRAINT `CommunicationNote_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
