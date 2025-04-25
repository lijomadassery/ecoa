<template>
  <v-layout class="fill-height">
    <!-- App Bar -->
    <v-app-bar color="primary" elevation="0">
      <v-app-bar-title>Prompt History</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <!-- Date Filter -->
      <div class="px-4 py-2">
        <v-card class="mb-3 rounded-lg pa-2" variant="flat">
          <div class="d-flex align-center pb-2">
            <v-icon icon="mdi-calendar" color="primary" class="mr-2"></v-icon>
            <span class="text-subtitle-2">Date Range</span>
            <v-spacer></v-spacer>
            <v-menu
              v-model="showRangeMenu"
              :close-on-content-click="true"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  density="comfortable"
                  variant="text"
                  size="small"
                  color="primary"
                  class="text-none"
                >
                  {{ dateRanges[selectedDateRange].label }}
                  <v-icon icon="mdi-chevron-down" end></v-icon>
                </v-btn>
              </template>
              <v-list density="compact" nav class="pa-2">
                <v-list-item
                  v-for="(range, key) in dateRanges"
                  :key="key"
                  :value="key"
                  :title="range.label"
                  @click="selectedDateRange = key"
                  :active="selectedDateRange === key"
                  active-color="primary"
                ></v-list-item>
              </v-list>
            </v-menu>
          </div>
          
          <v-divider></v-divider>
          
          <div class="date-display pa-2 d-flex align-center">
            <div>
              <div class="text-body-2">{{ dateRangeText }}</div>
              <div class="text-caption text-medium-emphasis">{{ filteredPrompts.length }} prompts</div>
            </div>
            <v-spacer></v-spacer>
            <v-menu
              v-model="showCalendarMenu"
              :close-on-content-click="false"
              v-if="selectedDateRange === 'custom'"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-calendar-edit"
                  variant="text"
                  density="comfortable"
                  color="primary"
                ></v-btn>
              </template>
              <v-card min-width="300">
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <v-date-picker
                        v-model="dateRange"
                        range
                        density="compact"
                        color="primary"
                        @update:model-value="updateDateRange"
                      ></v-date-picker>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="showCalendarMenu = false">Done</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </div>
        </v-card>
      </div>

      <!-- History Timeline -->
      <div class="px-4 fill-height" style="background-color: rgb(250, 250, 250)">
        <div v-if="loading" class="d-flex justify-center align-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="filteredPrompts.length === 0" class="text-center py-4">
          <v-icon icon="mdi-history" size="48" color="grey-lighten-1" class="mb-2"></v-icon>
          <div class="text-body-1 text-medium-emphasis">No prompts for this period</div>
        </div>

        <v-timeline v-else density="compact" align="start" line-thickness="1">
          <template v-for="(group, date) in groupedPrompts" :key="date">
            <!-- Date Header -->
            <v-timeline-item
              dot-color="primary"
              size="small"
              fill-dot
              class="date-header-item"
            >
              <div class="date-header d-flex align-center">
                <span class="date-text">{{ formatHeaderDate(date) }}</span>
                <span class="date-count">{{ group.length }} prompts</span>
              </div>
            </v-timeline-item>
            
            <!-- Prompts for this date -->
            <v-timeline-item
              v-for="prompt in group"
              :key="prompt.id"
              :dot-color="getStatusColor(prompt.status)"
              size="x-small"
              line-color="grey-lighten-3"
            >
              <template v-slot:opposite>
                <div class="text-caption text-medium-emphasis">
                  <div class="timeline-time">{{ formatTime(prompt.createdAt) }}</div>
                </div>
              </template>

              <v-card variant="flat" class="mb-2 rounded-lg" color="white">
                <v-card-item class="pa-3">
                  <template v-slot:prepend>
                    <v-avatar color="grey-lighten-3" size="40" class="mr-3">
                      <v-img
                        v-if="prompt.individual.profilePicture"
                        :src="prompt.individual.profilePicture"
                        :alt="`${prompt.individual.firstName} ${prompt.individual.lastName}`"
                      ></v-img>
                      <span v-else class="text-body-2">{{ getInitials(prompt.individual.firstName, prompt.individual.lastName) }}</span>
                    </v-avatar>
                  </template>

                  <v-card-title class="text-body-1 pa-0 pb-1">
                    {{ prompt.individual.firstName }} {{ prompt.individual.lastName }} - CDCR# {{ prompt.individual.cdcrNumber }}
                  </v-card-title>
                  <v-card-subtitle class="pa-0 pb-2">
                    {{ prompt.promptType.name }}
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
          </template>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  format, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  parseISO, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  isSameDay
} from 'date-fns'
import { usePromptStore } from '@/store/prompts'

const router = useRouter()
const promptStore = usePromptStore()

// State
const selectedDateRange = ref('today')
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showRangeMenu = ref(false)
const showCalendarMenu = ref(false)
const startDate = ref(format(new Date(), 'yyyy-MM-dd'))
const endDate = ref(format(new Date(), 'yyyy-MM-dd'))
const dateRange = ref([])
const syncing = ref(false)

// Computed
const loading = computed(() => promptStore.loading)

const dateRanges = computed(() => {
  const today = new Date()
  
  return {
    today: {
      start: startOfDay(today),
      end: endOfDay(today),
      label: 'Today'
    },
    yesterday: {
      start: startOfDay(subDays(today, 1)),
      end: endOfDay(subDays(today, 1)),
      label: 'Yesterday'
    },
    thisWeek: {
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 }),
      label: 'This Week'
    },
    lastWeek: {
      start: startOfWeek(subWeeks(today, 1), { weekStartsOn: 0 }),
      end: endOfWeek(subWeeks(today, 1), { weekStartsOn: 0 }),
      label: 'Last Week'
    },
    lastMonth: {
      start: startOfMonth(subMonths(today, 1)),
      end: endOfMonth(subMonths(today, 1)),
      label: 'Last Month'
    },
    custom: {
      start: parseISO(startDate.value),
      end: endOfDay(parseISO(endDate.value)),
      label: 'Custom Range'
    }
  }
})

const dateRangeText = computed(() => {
  if (selectedDateRange.value === 'custom') {
    return `${format(parseISO(startDate.value), 'MMM d, yyyy')} - ${format(parseISO(endDate.value), 'MMM d, yyyy')}`
  }
  
  const range = dateRanges.value[selectedDateRange.value]
  if (selectedDateRange.value === 'today' || selectedDateRange.value === 'yesterday') {
    return format(range.start, 'MMM d, yyyy')
  }
  
  return `${format(range.start, 'MMM d, yyyy')} - ${format(range.end, 'MMM d, yyyy')}`
})

const formattedStartDate = computed(() => {
  return format(parseISO(startDate.value), 'MMM d, yyyy')
})

const formattedEndDate = computed(() => {
  return format(parseISO(endDate.value), 'MMM d, yyyy')
})

const filteredPrompts = computed(() => {
  if (!promptStore.prompts.length) return []
  
  let range
  if (selectedDateRange.value === 'custom') {
    range = {
      start: startOfDay(parseISO(startDate.value)),
      end: endOfDay(parseISO(endDate.value))
    }
  } else {
    range = dateRanges.value[selectedDateRange.value]
  }
  
  return promptStore.prompts.filter(prompt => {
    const promptDate = new Date(prompt.createdAt)
    return isWithinInterval(promptDate, { start: range.start, end: range.end })
  })
})

const groupedPrompts = computed(() => {
  const grouped = {}
  filteredPrompts.value.forEach(prompt => {
    const date = format(new Date(prompt.createdAt), 'yyyy-MM-dd')
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(prompt)
  })
  
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })
  
  const sortedGroups = Object.entries(grouped)
    .sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .reduce((acc, [date, prompts]) => {
      acc[format(new Date(date), 'MMM d, yyyy')] = prompts
      return acc
    }, {})
    
  return sortedGroups
})

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
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

const formatDate = (dateTime: Date | string) => {
  const date = new Date(dateTime)
  return format(date, 'MMM d, yyyy')
}

const formatTime = (dateTime: Date | string) => {
  const date = new Date(dateTime)
  return format(date, 'h:mm a')
}

const formatHeaderDate = (date: string) => {
  if (date.includes(',')) {
    return date
  }
  const formattedDate = new Date(date)
  return format(formattedDate, 'MMM d, yyyy')
}

const syncData = async () => {
  try {
    syncing.value = true
    await promptStore.fetchPrompts()
  } catch (error) {
    console.error('Failed to sync:', error)
  } finally {
    syncing.value = false
  }
}

const navigateToRoster = () => {
  router.push('/roster')
}

const updateDateRange = (range) => {
  if (range && range.length === 2) {
    startDate.value = range[0]
    endDate.value = range[1]
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      promptStore.fetchPromptTypes(),
      promptStore.fetchPrompts()
    ])
  } catch (error) {
    console.error('Error initializing history view:', error)
  }
})

// Watchers
watch(() => selectedDateRange.value, (newValue) => {
  if (newValue === 'custom') {
    startDate.value = format(new Date(), 'yyyy-MM-dd')
    endDate.value = format(new Date(), 'yyyy-MM-dd')
  }
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
  min-width: 100px !important;
}

:deep(.v-timeline-divider__dot) {
  background: white !important;
  elevation: 1;
}

:deep(.v-timeline-divider__inner-dot) {
  border: 2px solid white;
  margin: 2px;
}

.w-100 {
  width: 100%;
}

.timeline-date {
  font-weight: 500;
}

.timeline-time {
  opacity: 0.8;
}

.date-header {
  background-color: #f1f7ff;
  border: 1px solid rgba(33, 150, 243, 0.2);
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.date-text {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.date-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  margin-left: 8px;
}

/* Update the dot style for date headers */
:deep(.v-timeline-item--fill-dot .v-timeline-divider__inner-dot) {
  border: none !important;
}

/* Style the date chips */
.date-count-chip {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.75;
}

/* Adjust timeline alignment */
:deep(.v-timeline--align-start .v-timeline-item__body) {
  margin-left: 12px;
}

/* Make the date header dots more vibrant */
:deep(.date-header-item .v-timeline-divider__inner-dot) {
  background-color: #2196f3 !important;
}
</style> 