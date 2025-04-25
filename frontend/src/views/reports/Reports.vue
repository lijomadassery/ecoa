<template>
  <div class="reports">
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center px-4 py-3">
        <span class="text-h5">Reports</span>
        <v-spacer></v-spacer>
        
        <!-- Date Range Picker -->
        <div class="d-flex align-center">
          <v-menu
            v-model="showDatePicker"
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                v-bind="props"
                prepend-icon="mdi-calendar"
                variant="tonal"
              >
                {{ formatDateRange }}
              </v-btn>
            </template>
            <v-date-picker
              v-model="dateRange"
              range
              @update:model-value="showDatePicker = false"
            ></v-date-picker>
          </v-menu>
          
          <v-btn
            icon
            variant="text"
            class="ml-2"
            @click="refreshData"
          >
            <v-icon>mdi-refresh</v-icon>
            <v-tooltip activator="parent">Refresh Data</v-tooltip>
          </v-btn>
        </div>
      </v-card-title>

      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="center"
      >
        <v-tab value="completion">Prompt Completion</v-tab>
        <v-tab value="individual">Individual Activity</v-tab>
        <v-tab value="staff">Staff Performance</v-tab>
      </v-tabs>

      <v-card-text class="pa-4">
        <v-window v-model="activeTab">
          <!-- Prompt Completion Report -->
          <v-window-item value="completion">
            <div v-if="isLoading.completion">
              <v-skeleton-loader type="article"></v-skeleton-loader>
            </div>
            <div v-else-if="completionStats">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-item>
                      <v-card-title>Total Prompts</v-card-title>
                      <div class="text-h4">{{ completionStats.totalPrompts }}</div>
                    </v-card-item>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-item>
                      <v-card-title>Completion Rate</v-card-title>
                      <div class="text-h4">{{ completionStats.completionRate }}%</div>
                    </v-card-item>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-item>
                      <v-card-title>Pending</v-card-title>
                      <div class="text-h4">{{ completionStats.pendingPrompts }}</div>
                    </v-card-item>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-item>
                      <v-card-title>Refused</v-card-title>
                      <div class="text-h4">{{ completionStats.refusedPrompts }}</div>
                    </v-card-item>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Line Chart -->
              <v-card class="mt-4" variant="outlined">
                <v-card-title>Daily Completion Trends</v-card-title>
                <v-card-text>
                  <!-- Add line chart component here -->
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>

          <!-- Individual Activity Report -->
          <v-window-item value="individual">
            <div v-if="isLoading.individual">
              <v-skeleton-loader type="table"></v-skeleton-loader>
            </div>
            <div v-else>
              <v-data-table
                :headers="individualHeaders"
                :items="individualStats"
                :search="search"
                class="elevation-1"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-text-field
                      v-model="search"
                      prepend-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      class="mx-4"
                    ></v-text-field>
                  </v-toolbar>
                </template>

                <template v-slot:item.completionRate="{ item }">
                  <v-chip
                    :color="getCompletionRateColor(item.raw.completionRate)"
                    size="small"
                  >
                    {{ item.raw.completionRate }}%
                  </v-chip>
                </template>

                <template v-slot:item.lastPromptDate="{ item }">
                  {{ formatDate(item.raw.lastPromptDate) }}
                </template>
              </v-data-table>
            </div>
          </v-window-item>

          <!-- Staff Performance Report -->
          <v-window-item value="staff">
            <div v-if="isLoading.staff">
              <v-skeleton-loader type="table"></v-skeleton-loader>
            </div>
            <div v-else>
              <v-data-table
                :headers="staffHeaders"
                :items="staffStats"
                :search="search"
                class="elevation-1"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-text-field
                      v-model="search"
                      prepend-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      class="mx-4"
                    ></v-text-field>
                  </v-toolbar>
                </template>

                <template v-slot:item.completionRate="{ item }">
                  {{ (item.raw.completedPrompts / item.raw.totalPrompts * 100).toFixed(1) }}%
                </template>

                <template v-slot:item.averageResponseTime="{ item }">
                  {{ formatDuration(item.raw.averageResponseTime) }}
                </template>
              </v-data-table>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ReportsService, type PromptCompletionStats, type IndividualActivityStats, type StaffPerformanceStats } from '@/services/reports.service'

// State
const activeTab = ref('completion')
const showDatePicker = ref(false)
const dateRange = ref([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
  new Date().toISOString().substr(0, 10)
])
const search = ref('')

const completionStats = ref<PromptCompletionStats | null>(null)
const individualStats = ref<IndividualActivityStats[]>([])
const staffStats = ref<StaffPerformanceStats[]>([])

const isLoading = ref({
  completion: false,
  individual: false,
  staff: false
})

// Table headers
const individualHeaders = [
  { title: 'CDCR Number', key: 'cdcrNumber' },
  { title: 'Name', key: 'firstName', value: (item: IndividualActivityStats) => `${item.firstName} ${item.lastName}` },
  { title: 'Total Prompts', key: 'totalPrompts', align: 'end' },
  { title: 'Completion Rate', key: 'completionRate', align: 'end' },
  { title: 'Last Prompt', key: 'lastPromptDate' }
]

const staffHeaders = [
  { title: 'Badge Number', key: 'badgeNumber' },
  { title: 'Name', key: 'firstName', value: (item: StaffPerformanceStats) => `${item.firstName} ${item.lastName}` },
  { title: 'Total Prompts', key: 'totalPrompts', align: 'end' },
  { title: 'Completion Rate', key: 'completionRate', align: 'end' },
  { title: 'Avg Response Time', key: 'averageResponseTime', align: 'end' }
]

// Computed
const formatDateRange = computed(() => {
  if (dateRange.value.length !== 2) return 'Select dates'
  return `${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`
})

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getCompletionRateColor = (rate: number) => {
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'error'
}

const fetchCompletionStats = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) return
  
  isLoading.value.completion = true
  try {
    completionStats.value = await ReportsService.getPromptCompletionStats(
      dateRange.value[0],
      dateRange.value[1]
    )
  } catch (error) {
    console.error('Error fetching completion stats:', error)
  } finally {
    isLoading.value.completion = false
  }
}

const fetchIndividualStats = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) return
  
  isLoading.value.individual = true
  try {
    individualStats.value = await ReportsService.getIndividualActivityStats(
      dateRange.value[0],
      dateRange.value[1]
    )
  } catch (error) {
    console.error('Error fetching individual stats:', error)
  } finally {
    isLoading.value.individual = false
  }
}

const fetchStaffStats = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) return
  
  isLoading.value.staff = true
  try {
    staffStats.value = await ReportsService.getStaffPerformanceStats(
      dateRange.value[0],
      dateRange.value[1]
    )
  } catch (error) {
    console.error('Error fetching staff stats:', error)
  } finally {
    isLoading.value.staff = false
  }
}

const refreshData = () => {
  switch (activeTab.value) {
    case 'completion':
      fetchCompletionStats()
      break
    case 'individual':
      fetchIndividualStats()
      break
    case 'staff':
      fetchStaffStats()
      break
  }
}

// Watchers
watch(dateRange, () => {
  if (dateRange.value.length === 2) {
    refreshData()
  }
})

watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'completion':
      if (!completionStats.value) fetchCompletionStats()
      break
    case 'individual':
      if (!individualStats.value.length) fetchIndividualStats()
      break
    case 'staff':
      if (!staffStats.value.length) fetchStaffStats()
      break
  }
})

// Lifecycle
onMounted(() => {
  fetchCompletionStats()
})
</script>

<style scoped>
.reports {
  height: 100%;
}

.v-card {
  border-radius: 8px;
}

.v-data-table {
  border-radius: 8px;
}
</style> 