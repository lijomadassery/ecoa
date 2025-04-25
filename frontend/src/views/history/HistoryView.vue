<template>
  <v-layout class="fill-height">
    <!-- App Bar -->
    <v-app-bar color="primary" elevation="0">
      <v-app-bar-title>Prompt History</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <!-- Date Filter -->
      <div class="px-4 py-2">
        <v-menu
          v-model="showDatePicker"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="selectedDate"
              prepend-inner-icon="mdi-calendar"
              readonly
              variant="outlined"
              density="compact"
              hide-details
              class="rounded-lg"
              bg-color="white"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="selectedDate"
            @update:model-value="showDatePicker = false"
          ></v-date-picker>
        </v-menu>
      </div>

      <!-- History Timeline -->
      <div class="px-4 fill-height" style="background-color: rgb(250, 250, 250)">
        <div v-if="loading" class="d-flex justify-center align-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="prompts.length === 0" class="text-center py-4">
          <v-icon icon="mdi-history" size="48" color="grey-lighten-1" class="mb-2"></v-icon>
          <div class="text-body-1 text-medium-emphasis">No prompts for this date</div>
        </div>

        <v-timeline v-else density="compact" align="start" line-thickness="1">
          <v-timeline-item
            v-for="prompt in prompts"
            :key="prompt.id"
            :dot-color="getStatusColor(prompt.status)"
            size="x-small"
            line-color="grey-lighten-3"
          >
            <template v-slot:opposite>
              <div class="text-caption text-medium-emphasis">{{ format(new Date(prompt.timestamp), 'h:mm a') }}</div>
            </template>

            <v-card variant="flat" class="mb-2 rounded-lg" color="white">
              <v-card-item class="pa-3">
                <template v-slot:prepend>
                  <v-avatar color="grey-lighten-3" size="40" class="mr-3">
                    <span class="text-body-2">{{ getInitials(prompt.individual.firstName, prompt.individual.lastName) }}</span>
                  </v-avatar>
                </template>

                <v-card-title class="text-body-1 pa-0 pb-1">
                  {{ prompt.individual.firstName }} {{ prompt.individual.lastName }} - CDCR# {{ prompt.individual.cdcrNumber }}
                </v-card-title>
                <v-card-subtitle class="pa-0 pb-2">
                  {{ prompt.type }}
                </v-card-subtitle>

                <v-chip
                  :color="getStatusColor(prompt.status)"
                  size="small"
                  variant="flat"
                  class="text-caption"
                  density="compact"
                >
                  {{ prompt.status.toLowerCase() }}
                </v-chip>
              </v-card-item>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </div>

      <!-- Sync Button -->
      <v-card
        flat
        class="pa-4"
        style="position: sticky; bottom: 56px; background: white;"
      >
        <v-btn
          color="primary"
          block
          :loading="syncing"
          @click="syncData"
          class="rounded-lg"
        >
          Sync Data
        </v-btn>
      </v-card>

      <!-- Bottom Navigation -->
      <v-bottom-navigation grow color="primary" elevation="0">
        <v-btn @click="navigateToRoster">
          <v-icon>mdi-account-group</v-icon>
          <span>Roster</span>
        </v-btn>
        <v-btn>
          <v-icon>mdi-history</v-icon>
          <span>History</span>
        </v-btn>
      </v-bottom-navigation>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'

interface Individual {
  id: string
  firstName: string
  lastName: string
  cdcrNumber: string
}

interface Prompt {
  id: string
  individual: Individual
  type: string
  status: 'SIGNED' | 'REFUSED' | 'ATTEMPTED'
  timestamp: string
}

const router = useRouter()

// State
const loading = ref(false)
const syncing = ref(false)
const showDatePicker = ref(false)
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))

// Mock data - Replace with API call
const prompts = ref<Prompt[]>([
  {
    id: '1',
    individual: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      cdcrNumber: 'AZ1234'
    },
    type: 'Yard Time',
    status: 'SIGNED',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    individual: {
      id: '2',
      firstName: 'Richard',
      lastName: 'Smith',
      cdcrNumber: 'BK2345'
    },
    type: 'Meals',
    status: 'REFUSED',
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    individual: {
      id: '3',
      firstName: 'Michael',
      lastName: 'Jones',
      cdcrNumber: 'CL3456'
    },
    type: 'Medical',
    status: 'ATTEMPTED',
    timestamp: new Date().toISOString()
  }
])

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case 'SIGNED':
      return 'success'
    case 'REFUSED':
      return 'error'
    case 'ATTEMPTED':
      return 'warning'
    default:
      return 'grey'
  }
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

const syncData = async () => {
  try {
    syncing.value = true
    // TODO: Implement sync functionality
    await new Promise(resolve => setTimeout(resolve, 1500))
  } catch (error) {
    console.error('Failed to sync:', error)
  } finally {
    syncing.value = false
  }
}

const navigateToRoster = () => {
  router.push('/roster')
}

// Lifecycle
onMounted(() => {
  // TODO: Fetch initial data
})
</script>

<style scoped>
:deep(.v-timeline-item__body) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

:deep(.v-timeline-item__opposite) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

:deep(.v-timeline-divider__dot) {
  background: white !important;
  elevation: 1;
}

:deep(.v-timeline-divider__inner-dot) {
  border: 2px solid white;
  margin: 2px;
}
</style> 