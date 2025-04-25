import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedPromptTypes } from './seeds/promptTypes';

const prisma = new PrismaClient();

/**
 * Seed the database with initial data
 */
async function main() {
  console.log('Starting database seeding...');

  // Hash passwords
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const officerPassword = await bcrypt.hash('officer123', saltRounds);

  try {
    // Create facilities
    console.log('Creating facilities...');
    const facilities = await Promise.all([
      prisma.facility.upsert({
        where: {
          code: 'SQ'
        },
        update: {
          name: 'San Quentin State Prison',
          region: 'Northern California'
        },
        create: {
          name: 'San Quentin State Prison',
          code: 'SQ',
          region: 'Northern California'
        }
      }),
      prisma.facility.upsert({
        where: {
          code: 'FSP'
        },
        update: {
          name: 'Folsom State Prison',
          region: 'Northern California'
        },
        create: {
          name: 'Folsom State Prison',
          code: 'FSP',
          region: 'Northern California'
        }
      }),
      prisma.facility.upsert({
        where: {
          code: 'SAC'
        },
        update: {
          name: 'California State Prison, Sacramento',
          region: 'Northern California'
        },
        create: {
          name: 'California State Prison, Sacramento',
          code: 'SAC',
          region: 'Northern California'
        }
      }),
    ]);

    // Create units
    console.log('Creating housing units...');
    const units = await Promise.all([
      prisma.unit.upsert({
        where: {
          code_facilityId: {
            code: 'A',
            facilityId: facilities[0].id
          }
        },
        update: {
          name: 'Building A'
        },
        create: {
          name: 'Building A',
          code: 'A',
          facilityId: facilities[0].id,
        },
      }),
      prisma.unit.upsert({
        where: {
          code_facilityId: {
            code: 'B',
            facilityId: facilities[0].id
          }
        },
        update: {
          name: 'Building B'
        },
        create: {
          name: 'Building B',
          code: 'B',
          facilityId: facilities[0].id,
        },
      }),
      prisma.unit.upsert({
        where: {
          code_facilityId: {
            code: 'C',
            facilityId: facilities[0].id
          }
        },
        update: {
          name: 'Building C'
        },
        create: {
          name: 'Building C',
          code: 'C',
          facilityId: facilities[0].id,
        },
      }),
      prisma.unit.upsert({
        where: {
          code_facilityId: {
            code: 'NB',
            facilityId: facilities[1].id
          }
        },
        update: {
          name: 'North Block'
        },
        create: {
          name: 'North Block',
          code: 'NB',
          facilityId: facilities[1].id,
        },
      }),
      prisma.unit.upsert({
        where: {
          code_facilityId: {
            code: 'SB',
            facilityId: facilities[1].id
          }
        },
        update: {
          name: 'South Block'
        },
        create: {
          name: 'South Block',
          code: 'SB',
          facilityId: facilities[1].id,
        },
      }),
    ]);

    // Create users
    console.log('Creating users...');
    const users = await Promise.all([
      // Admin user
      prisma.user.upsert({
        where: {
          username: 'admin'
        },
        update: {
          password: adminPassword,
          firstName: 'System',
          lastName: 'Administrator',
          badgeNumber: 'ADMIN001',
          role: 'ADMIN',
          facilityId: facilities[0].id,
          profilePicture: `https://ui-avatars.com/api/?name=System+Administrator&background=1976D2&color=fff&size=128`
        },
        create: {
          username: 'admin',
          password: adminPassword,
          firstName: 'System',
          lastName: 'Administrator',
          badgeNumber: 'ADMIN001',
          role: 'ADMIN',
          facilityId: facilities[0].id,
          profilePicture: `https://ui-avatars.com/api/?name=System+Administrator&background=1976D2&color=fff&size=128`
        },
      }),
      // Officer users
      prisma.user.upsert({
        where: {
          username: 'officer1'
        },
        update: {
          password: officerPassword,
          firstName: 'John',
          lastName: 'Smith',
          badgeNumber: 'CO12345',
          role: 'OFFICER',
          facilityId: facilities[0].id,
          unitId: units[0].id,
          profilePicture: `https://ui-avatars.com/api/?name=John+Smith&background=1976D2&color=fff&size=128`
        },
        create: {
          username: 'officer1',
          password: officerPassword,
          firstName: 'John',
          lastName: 'Smith',
          badgeNumber: 'CO12345',
          role: 'OFFICER',
          facilityId: facilities[0].id,
          unitId: units[0].id,
          profilePicture: `https://ui-avatars.com/api/?name=John+Smith&background=1976D2&color=fff&size=128`
        },
      }),
      prisma.user.upsert({
        where: {
          username: 'officer2'
        },
        update: {
          password: officerPassword,
          firstName: 'Jane',
          lastName: 'Doe',
          badgeNumber: 'CO23456',
          role: 'OFFICER',
          facilityId: facilities[0].id,
          unitId: units[1].id,
          profilePicture: `https://ui-avatars.com/api/?name=Jane+Doe&background=1976D2&color=fff&size=128`
        },
        create: {
          username: 'officer2',
          password: officerPassword,
          firstName: 'Jane',
          lastName: 'Doe',
          badgeNumber: 'CO23456',
          role: 'OFFICER',
          facilityId: facilities[0].id,
          unitId: units[1].id,
          profilePicture: `https://ui-avatars.com/api/?name=Jane+Doe&background=1976D2&color=fff&size=128`
        },
      }),
      prisma.user.upsert({
        where: {
          username: 'officer3'
        },
        update: {
          password: officerPassword,
          firstName: 'Robert',
          lastName: 'Johnson',
          badgeNumber: 'CO34567',
          role: 'OFFICER',
          facilityId: facilities[1].id,
          unitId: units[3].id,
          profilePicture: `https://ui-avatars.com/api/?name=Robert+Johnson&background=1976D2&color=fff&size=128`
        },
        create: {
          username: 'officer3',
          password: officerPassword,
          firstName: 'Robert',
          lastName: 'Johnson',
          badgeNumber: 'CO34567',
          role: 'OFFICER',
          facilityId: facilities[1].id,
          unitId: units[3].id,
          profilePicture: `https://ui-avatars.com/api/?name=Robert+Johnson&background=1976D2&color=fff&size=128`
        },
      }),
      // Supervisor
      prisma.user.upsert({
        where: {
          username: 'supervisor1'
        },
        update: {
          password: await bcrypt.hash('supervisor123', saltRounds),
          firstName: 'Michael',
          lastName: 'Wilson',
          badgeNumber: 'SV12345',
          role: 'SUPERVISOR',
          facilityId: facilities[0].id,
          profilePicture: `https://ui-avatars.com/api/?name=Michael+Wilson&background=1976D2&color=fff&size=128`
        },
        create: {
          username: 'supervisor1',
          password: await bcrypt.hash('supervisor123', saltRounds),
          firstName: 'Michael',
          lastName: 'Wilson',
          badgeNumber: 'SV12345',
          role: 'SUPERVISOR',
          facilityId: facilities[0].id,
          profilePicture: `https://ui-avatars.com/api/?name=Michael+Wilson&background=1976D2&color=fff&size=128`
        },
      }),
    ]);

    // Create disabilities
    console.log('Creating disabilities...');
    const disabilities = await Promise.all([
      prisma.disability.upsert({
        where: {
          code: 'HOH'
        },
        update: {
          type: 'Hard of Hearing',
          description: 'Partial hearing loss requiring accommodations',
        },
        create: {
          type: 'Hard of Hearing',
          description: 'Partial hearing loss requiring accommodations',
          code: 'HOH',
        },
      }),
      prisma.disability.upsert({
        where: {
          code: 'DEAF'
        },
        update: {
          type: 'Deaf',
          description: 'Complete hearing loss',
        },
        create: {
          type: 'Deaf',
          description: 'Complete hearing loss',
          code: 'DEAF',
        },
      }),
      prisma.disability.upsert({
        where: {
          code: 'HAID'
        },
        update: {
          type: 'Hearing Aid',
          description: 'Uses hearing aid device',
        },
        create: {
          type: 'Hearing Aid',
          description: 'Uses hearing aid device',
          code: 'HAID',
        },
      }),
    ]);

    // Create individuals
    console.log('Creating individuals...');
    const individuals = await Promise.all([
      prisma.individual.upsert({
        where: {
          cdcrNumber: 'AZ1234'
        },
        update: {
          firstName: 'John',
          lastName: 'Doe',
          housingUnit: 'A-202',
          facilityId: facilities[0].id,
        },
        create: {
          cdcrNumber: 'AZ1234',
          firstName: 'John',
          lastName: 'Doe',
          housingUnit: 'A-202',
          facilityId: facilities[0].id,
        },
      }),
      prisma.individual.upsert({
        where: {
          cdcrNumber: 'BK2345'
        },
        update: {
          firstName: 'Richard',
          lastName: 'Smith',
          housingUnit: 'A-105',
          facilityId: facilities[0].id,
        },
        create: {
          cdcrNumber: 'BK2345',
          firstName: 'Richard',
          lastName: 'Smith',
          housingUnit: 'A-105',
          facilityId: facilities[0].id,
        },
      }),
      prisma.individual.upsert({
        where: {
          cdcrNumber: 'CL3456'
        },
        update: {
          firstName: 'Michael',
          lastName: 'Jones',
          housingUnit: 'B-310',
          facilityId: facilities[0].id,
        },
        create: {
          cdcrNumber: 'CL3456',
          firstName: 'Michael',
          lastName: 'Jones',
          housingUnit: 'B-310',
          facilityId: facilities[0].id,
        },
      }),
      prisma.individual.upsert({
        where: {
          cdcrNumber: 'DM4567'
        },
        update: {
          firstName: 'James',
          lastName: 'Wilson',
          housingUnit: 'B-115',
          facilityId: facilities[0].id,
        },
        create: {
          cdcrNumber: 'DM4567',
          firstName: 'James',
          lastName: 'Wilson',
          housingUnit: 'B-115',
          facilityId: facilities[0].id,
        },
      }),
      prisma.individual.upsert({
        where: {
          cdcrNumber: 'EN5678'
        },
        update: {
          firstName: 'Robert',
          lastName: 'Brown',
          housingUnit: 'NB-205',
          facilityId: facilities[1].id,
        },
        create: {
          cdcrNumber: 'EN5678',
          firstName: 'Robert',
          lastName: 'Brown',
          housingUnit: 'NB-205',
          facilityId: facilities[1].id,
        },
      }),
      prisma.individual.upsert({
        where: {
          cdcrNumber: 'FO6789'
        },
        update: {
          firstName: 'William',
          lastName: 'Davis',
          housingUnit: 'NB-302',
          facilityId: facilities[1].id,
        },
        create: {
          cdcrNumber: 'FO6789',
          firstName: 'William',
          lastName: 'Davis',
          housingUnit: 'NB-302',
          facilityId: facilities[1].id,
        },
      }),
    ]);

    // Assign disabilities to individuals
    console.log('Assigning disabilities to individuals...');
    await Promise.all([
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[0].id,
            disabilityId: disabilities[0].id,
          }
        },
        update: {
          notes: 'Moderate hearing loss in left ear',
        },
        create: {
          individualId: individuals[0].id,
          disabilityId: disabilities[0].id,
          notes: 'Moderate hearing loss in left ear',
        },
      }),
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[1].id,
            disabilityId: disabilities[0].id,
          }
        },
        update: {
          notes: 'Mild to moderate hearing loss in both ears',
        },
        create: {
          individualId: individuals[1].id,
          disabilityId: disabilities[0].id,
          notes: 'Mild to moderate hearing loss in both ears',
        },
      }),
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[2].id,
            disabilityId: disabilities[0].id,
          }
        },
        update: {
          notes: 'Severe hearing loss in right ear',
        },
        create: {
          individualId: individuals[2].id,
          disabilityId: disabilities[0].id,
          notes: 'Severe hearing loss in right ear',
        },
      }),
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[2].id,
            disabilityId: disabilities[2].id,
          }
        },
        update: {
          notes: 'Uses hearing aid in right ear',
        },
        create: {
          individualId: individuals[2].id,
          disabilityId: disabilities[2].id,
          notes: 'Uses hearing aid in right ear',
        },
      }),
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[3].id,
            disabilityId: disabilities[0].id,
          }
        },
        update: {
          notes: 'Moderate hearing loss in both ears',
        },
        create: {
          individualId: individuals[3].id,
          disabilityId: disabilities[0].id,
          notes: 'Moderate hearing loss in both ears',
        },
      }),
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[4].id,
            disabilityId: disabilities[1].id,
          }
        },
        update: {
          notes: 'Complete hearing loss',
        },
        create: {
          individualId: individuals[4].id,
          disabilityId: disabilities[1].id,
          notes: 'Complete hearing loss',
        },
      }),
      prisma.individualDisability.upsert({
        where: {
          individualId_disabilityId: {
            individualId: individuals[5].id,
            disabilityId: disabilities[0].id,
          }
        },
        update: {
          notes: 'Progressive hearing loss',
        },
        create: {
          individualId: individuals[5].id,
          disabilityId: disabilities[0].id,
          notes: 'Progressive hearing loss',
        },
      }),
    ]);

    // Create memory bank entries
    console.log('Creating memory bank entries...');
    await Promise.all([
      prisma.memoryBank.create({
        data: {
          title: 'Communication Preferences',
          content: 'Prefers written communication and visual cues. Responds well to gestures and facial expressions.',
          category: 'Communication',
          tags: ['written', 'visual', 'gestures'],
          priority: 1,
          status: 'ACTIVE',
          individualId: individuals[0].id,
          createdById: users[1].id,
          facilityId: facilities[0].id,
          unitId: units[0].id,
          attachments: [],
          metadata: {
            lastReviewDate: new Date().toISOString(),
            effectiveness: 'High',
            reviewedBy: users[1].username
          }
        }
      }),
      prisma.memoryBank.create({
        data: {
          title: 'Medical Appointments Protocol',
          content: 'Requires visual notification 30 minutes before medical appointments. Staff should ensure written instructions are provided.',
          category: 'Medical',
          tags: ['appointments', 'visual-notification', 'written-instructions'],
          priority: 2,
          status: 'ACTIVE',
          individualId: individuals[1].id,
          createdById: users[2].id,
          facilityId: facilities[0].id,
          unitId: units[1].id,
          attachments: [],
          metadata: {
            lastReviewDate: new Date().toISOString(),
            effectiveness: 'Medium',
            reviewedBy: users[2].username
          }
        }
      }),
      prisma.memoryBank.create({
        data: {
          title: 'Hearing Aid Maintenance',
          content: 'Uses hearing aid in right ear. Requires battery replacement every 2 weeks. Keep spare batteries in medical unit.',
          category: 'Equipment',
          tags: ['hearing-aid', 'maintenance', 'batteries'],
          priority: 1,
          status: 'ACTIVE',
          individualId: individuals[2].id,
          createdById: users[1].id,
          facilityId: facilities[0].id,
          unitId: units[0].id,
          attachments: [],
          metadata: {
            lastReviewDate: new Date().toISOString(),
            effectiveness: 'High',
            batterySchedule: 'Bi-weekly',
            reviewedBy: users[1].username
          }
        }
      })
    ]);

    // Create prompt types
    console.log('Creating prompt types...');
    await seedPromptTypes();

    // Create sample prompts
    console.log('Creating sample prompts...');
    await Promise.all([
      prisma.prompt.create({
        data: {
          userId: users[1].id,
          individualId: individuals[0].id,
          promptTypeId: 1, // Using ID 1 for Yard Time
          status: 'SIGNED',
          notes: 'Individual acknowledged prompt',
          location: 'Building A',
          deviceId: 'TABLET-001',
        },
      }),
      prisma.prompt.create({
        data: {
          userId: users[1].id,
          individualId: individuals[1].id,
          promptTypeId: 5, // Using ID 5 for Medical Appointment
          status: 'REFUSED',
          notes: 'Individual refused to acknowledge prompt',
          location: 'Building A',
          deviceId: 'TABLET-001',
        },
      }),
      prisma.prompt.create({
        data: {
          userId: users[2].id,
          individualId: individuals[2].id,
          promptTypeId: 2, // Using ID 2 for Morning Yard Time
          status: 'ATTEMPTED',
          notes: 'Individual was asleep, will attempt again later',
          location: 'Building B',
          deviceId: 'TABLET-002',
        },
      }),
      prisma.prompt.create({
        data: {
          userId: users[3].id,
          individualId: individuals[4].id,
          promptTypeId: 3, // Using ID 3 for Medical Checkup
          status: 'SIGNED',
          notes: 'Prompt delivered successfully',
          location: 'North Block',
          deviceId: 'TABLET-003',
        },
      }),
      prisma.prompt.create({
        data: {
          userId: users[3].id,
          individualId: individuals[5].id,
          promptTypeId: 4, // Using ID 4 for Medical Checkup
          status: 'SIGNED',
          notes: 'Individual needed clarification on appointment time',
          location: 'North Block',
          deviceId: 'TABLET-003',
        },
      }),
    ]);

    // Create sample audit log entries
    console.log('Creating audit log entries...');
    await Promise.all([
      prisma.auditLog.create({
        data: {
          userId: users[0].id,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: users[0].id,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: users[1].id,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: users[1].id,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15',
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: users[1].id,
          action: 'PROMPT_DELIVERED',
          entityType: 'PROMPT',
          entityId: 1,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15',
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: users[1].id,
          action: 'MEMORY_BANK_CREATED',
          entityType: 'MEMORY_BANK',
          entityId: 1,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15',
        },
      }),
    ]);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
