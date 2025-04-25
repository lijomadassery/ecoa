<template>
  <div class="reports">
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center px-4 py-3">
        <span class="text-h5">Reports</span>
        <v-spacer></v-spacer>
        
        <!-- Date Range Picker -->
        <div class="d-flex align-center">
          <v-menu
            v-model="showRangeMenu"
            :close-on-content-click="true"
            location="bottom end"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                density="comfortable"
                variant="tonal"
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
                @click="selectedDateRange = key as DateRangeKey"
                :active="selectedDateRange === key"
                active-color="primary"
              ></v-list-item>
            </v-list>
          </v-menu>
          
          <div class="date-display px-2 d-flex align-center">
            <div class="text-body-2">{{ dateRangeText }}</div>
          </div>
          
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
          
          <v-btn
            icon
            variant="text"
            class="ml-2"
            @click="refreshData"
            :loading="isLoading.completion || isLoading.individual || isLoading.staff"
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
        class="reports-tabs"
      >
        <v-tab value="completion" class="text-body-1">Prompt Completion</v-tab>
        <v-tab value="individual" class="text-body-1">Individual Activity</v-tab>
        <v-tab value="staff" class="text-body-1">Staff Performance</v-tab>
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
                      <div class="text-h4">
                        <v-chip
                          :color="getCompletionRateColor(completionStats.completionRate)"
                          size="large"
                        >
                          {{ completionStats.completionRate }}%
                        </v-chip>
                      </div>
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
                  <v-chart class="chart" :option="chartOption" autoresize />
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
                    :color="getCompletionRateColor(item.completionRate)"
                    size="small"
                  >
                    {{ item.completionRate }}%
                  </v-chip>
                </template>

                <template v-slot:item.lastPromptDate="{ item }">
                  {{ formatDate(item.lastPromptDate) }}
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

                <template v-slot:item.completedPrompts="{ item }">
                  <v-chip
                    :color="getCompletionRateColor(Number(getStaffCompletionRate(item)))"
                    size="small"
                  >
                    {{ getStaffCompletionRate(item) }}%
                  </v-chip>
                </template>

                <template v-slot:item.averageResponseTime="{ item }">
                  {{ formatDuration(item.averageResponseTime) }}
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
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
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
  subMonths
} from 'date-fns'

// Register ECharts components
use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

// Define date range type
type DateRangeKey = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'lastMonth' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

// State
const activeTab = ref('completion')
const selectedDateRange = ref<DateRangeKey>('thisWeek')
const showRangeMenu = ref(false)
const showCalendarMenu = ref(false)
const showDatePicker = ref(false)
const startDate = ref(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
const endDate = ref(format(new Date(), 'yyyy-MM-dd'))
const dateRange = ref([startDate.value, endDate.value])
const search = ref('')

const completionStats = ref<PromptCompletionStats | null>(null)
const individualStats = ref<IndividualActivityStats[]>([])
const staffStats = ref<StaffPerformanceStats[]>([])

const isLoading = ref({
  completion: false,
  individual: false,
  staff: false
})

// Table headers with proper typing
const individualHeaders = [
  { title: 'CDCR Number', key: 'cdcrNumber', align: 'start' as const },
  { 
    title: 'Name', 
    key: 'name',
    align: 'start' as const,
    value: (item: IndividualActivityStats) => `${item.firstName} ${item.lastName}` 
  },
  { title: 'Total Prompts', key: 'totalPrompts', align: 'end' as const },
  { title: 'Completion Rate', key: 'completionRate', align: 'end' as const },
  { title: 'Last Prompt', key: 'lastPromptDate', align: 'end' as const }
] as const

const staffHeaders = [
  { title: 'Badge Number', key: 'badgeNumber', align: 'start' as const },
  { 
    title: 'Name', 
    key: 'name',
    align: 'start' as const,
    value: (item: StaffPerformanceStats) => `${item.firstName} ${item.lastName}` 
  },
  { title: 'Total Prompts', key: 'totalPrompts', align: 'end' as const },
  { title: 'Completed Prompts', key: 'completedPrompts', align: 'end' as const },
  { title: 'Avg Response Time', key: 'averageResponseTime', align: 'end' as const }
] as const

// Computed
const dateRanges = computed<Record<DateRangeKey, DateRange>>(() => {
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

const formatDateRange = computed(() => {
  if (dateRange.value.length !== 2) return 'Select dates'
  return `${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`
})

const chartOption = computed(() => {
  if (!completionStats.value?.byDate) return {}

  const dates = completionStats.value.byDate.map(d => d.date)
  const completed = completionStats.value.byDate.map(d => d.completed)
  const pending = completionStats.value.byDate.map(d => d.pending)
  const refused = completionStats.value.byDate.map(d => d.refused)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Completed', 'Pending', 'Refused']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: dates.length > 7 ? 45 : 0, // Rotate labels if many dates
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Completed',
        type: 'bar',
        data: completed,
        color: '#4CAF50',
        stack: 'total',
        barWidth: '40%', // Make bars narrower
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: 'Pending',
        type: 'bar',
        data: pending,
        color: '#FFC107',
        stack: 'total',
        barWidth: '40%', // Make bars narrower
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: 'Refused',
        type: 'bar',
        data: refused,
        color: '#F44336',
        stack: 'total',
        barWidth: '40%', // Make bars narrower
        emphasis: {
          focus: 'series'
        }
      }
    ]
  }
})

// Add computed property for staff completion rate
const getStaffCompletionRate = (item: StaffPerformanceStats): string => {
  return ((item.completedPrompts / item.totalPrompts) * 100).toFixed(1)
}

// Methods
const formatDate = (date: string) => {
  if (!date) return ''
  return format(new Date(date), 'MMM d, yyyy')
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

const updateDateRange = (range: string[]) => {
  if (range && range.length === 2) {
    startDate.value = range[0]
    endDate.value = range[1]
  }
}

const fetchCompletionStats = async () => {
  let start, end
  
  if (selectedDateRange.value === 'custom') {
    start = startDate.value
    end = endDate.value
  } else {
    const range = dateRanges.value[selectedDateRange.value]
    start = format(range.start, 'yyyy-MM-dd')
    end = format(range.end, 'yyyy-MM-dd')
  }
  
  isLoading.value.completion = true
  try {
    completionStats.value = await ReportsService.getPromptCompletionStats(start, end)
  } catch (error) {
    console.error('Error fetching completion stats:', error)
  } finally {
    isLoading.value.completion = false
  }
}

const fetchIndividualStats = async () => {
  let start, end
  
  if (selectedDateRange.value === 'custom') {
    start = startDate.value
    end = endDate.value
  } else {
    const range = dateRanges.value[selectedDateRange.value]
    start = format(range.start, 'yyyy-MM-dd')
    end = format(range.end, 'yyyy-MM-dd')
  }
  
  isLoading.value.individual = true
  try {
    individualStats.value = await ReportsService.getIndividualActivityStats(start, end)
  } catch (error) {
    console.error('Error fetching individual stats:', error)
  } finally {
    isLoading.value.individual = false
  }
}

const fetchStaffStats = async () => {
  let start, end
  
  if (selectedDateRange.value === 'custom') {
    start = startDate.value
    end = endDate.value
  } else {
    const range = dateRanges.value[selectedDateRange.value]
    start = format(range.start, 'yyyy-MM-dd')
    end = format(range.end, 'yyyy-MM-dd')
  }
  
  isLoading.value.staff = true
  try {
    staffStats.value = await ReportsService.getStaffPerformanceStats(start, end)
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
watch(selectedDateRange, (newValue) => {
  if (newValue === 'custom') {
    startDate.value = format(new Date(), 'yyyy-MM-dd')
    endDate.value = format(new Date(), 'yyyy-MM-dd')
    dateRange.value = [startDate.value, endDate.value]
  } else {
    refreshData()
  }
})

watch([startDate, endDate], () => {
  if (selectedDateRange.value === 'custom') {
    refreshData()
  }
})

// Original dateRange watcher for backward compatibility
watch(dateRange, () => {
  if (dateRange.value.length === 2 && selectedDateRange.value === 'custom') {
    startDate.value = dateRange.value[0]
    endDate.value = dateRange.value[1]
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

.chart {
  height: 400px;
}

:deep(.reports-tabs) {
  .v-tab {
    min-width: 160px;
    padding: 0 24px;
    font-weight: 500;
  }
}

:deep(.v-tab--selected) {
  font-weight: 600;
}
</style> 