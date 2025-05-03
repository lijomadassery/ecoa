import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const promptTypes = [
  // Category 1 - Daily Activities
  {
    name: 'Meal',
    description: 'Notification for meal times and food service',
    category: 'daily'
  },
  {
    name: 'Yard',
    description: 'Notification for yard time and outdoor activities',
    category: 'daily'
  },
  {
    name: 'Day Room',
    description: 'Notification for day room activities and access',
    category: 'daily'
  },
  {
    name: 'Canteen',
    description: 'Notification for canteen access and services',
    category: 'daily'
  },

  // Category 2 - Programs
  {
    name: 'Work',
    description: 'Notification for work assignments and schedules',
    category: 'programs'
  },
  {
    name: 'School',
    description: 'Notification for educational programs and classes',
    category: 'programs'
  },
  {
    name: 'Programming',
    description: 'Notification for various programming activities and sessions',
    category: 'programs'
  },

  // Category 3 - Appointments
  {
    name: 'Visiting',
    description: 'Notification for visiting hours and appointments',
    category: 'appointments'
  },
  {
    name: 'Attorney Visit',
    description: 'Notification for legal visits and attorney meetings',
    category: 'appointments'
  },
  {
    name: 'Medical Appointments',
    description: 'Notification for medical appointments and healthcare services',
    category: 'appointments'
  },
  {
    name: 'Other',
    description: 'Notification for other miscellaneous appointments',
    category: 'appointments'
  }
]

async function seedPromptTypes() {
  console.log('Seeding prompt types...')
  
  for (const promptType of promptTypes) {
    const exists = await prisma.promptType.findFirst({
      where: {
        name: promptType.name,
        category: promptType.category
      }
    })

    if (!exists) {
      await prisma.promptType.create({
        data: promptType
      })
      console.log(`Created prompt type: ${promptType.name}`)
    } else {
      console.log(`Prompt type already exists: ${promptType.name}`)
    }
  }

  console.log('Prompt types seeding completed')
}

module.exports = { seedPromptTypes }; 