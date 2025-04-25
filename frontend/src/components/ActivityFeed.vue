<template>
  <v-card class="mb-4" rounded="lg">
    <v-card-title class="d-flex align-center px-4 py-3">
      <div class="text-h6">Recent Prompts</div>
      <v-chip v-if="props.categoryFilter" class="ml-2" size="small" closable @click:close="clearFilter">
        {{ props.categoryFilter }}
      </v-chip>
      <v-spacer></v-spacer>
      <v-btn
        v-if="refreshable"
        icon="mdi-refresh"
        size="small"
        variant="text"
        @click="fetchPrompts"
        :loading="loading"
        color="primary"
      ></v-btn>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="pa-0">
      <v-list class="py-0">
        <div v-if="loading && !promptStore.prompts.length" class="text-center py-6">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        
        <div v-else-if="!promptStore.prompts.length" class="text-center py-6 text-grey">
          <v-icon icon="mdi-clipboard-text-clock" size="48" color="grey-lighten-1" class="mb-2"></v-icon>
          <div>No recent prompts</div>
        </div>
        
        <template v-else>
          <!-- Group prompts by date -->
          <template v-for="(group, date) in groupedPrompts" :key="date">
            <!-- Date Header -->
            <v-list-subheader class="date-subheader">
              {{ formatHeaderDate(date) }}
            </v-list-subheader>
            
            <!-- Prompts for this date -->
            <v-list-item
              v-for="prompt in group"
              :key="prompt.id"
              @click="viewPromptDetails(prompt.id)"
              class="py-2 cursor-pointer"
              lines="three"
            >
              <template v-slot:prepend>
                <v-avatar :color="getStatusColor(prompt.status)" size="36" class="mr-3">
                  <v-img
                    v-if="prompt.individual.profilePicture"
                    :src="prompt.individual.profilePicture"
                    :alt="`${prompt.individual.firstName} ${prompt.individual.lastName}`"
                  ></v-img>
                  <span v-else class="text-caption text-white">{{ getInitials(prompt.individual.firstName, prompt.individual.lastName) }}</span>
                </v-avatar>
              </template>
              
              <v-list-item-title class="text-body-1 mb-1">
                {{ prompt.individual.firstName }} {{ prompt.individual.lastName }}
                <span class="text-caption text-medium-emphasis">
                  CDCR# {{ prompt.individual.cdcrNumber }}
                </span>
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-body-2 d-flex align-center">
                <v-icon icon="mdi-clipboard-text" size="small" class="mr-1"></v-icon>
                {{ prompt.promptType.name }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle class="text-caption text-medium-emphasis">
                {{ formatTime(prompt.createdAt) }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-chip
                  :color="getStatusColor(prompt.status)"
                  size="small"
                  variant="flat"
                  class="text-capitalize"
                >
                  {{ prompt.status.toLowerCase() }}
                </v-chip>
              </template>
            </v-list-item>
            
            <v-divider v-if="Object.keys(groupedPrompts).indexOf(date) < Object.keys(groupedPrompts).length - 1"></v-divider>
          </template>
        </template>
      </v-list>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-history"
        @click="navigateToHistory"
      >
        View All Prompts
      </v-btn>
    </v-card-actions>
  </v-card>
  
  <!-- Prompt Details Panel -->
  <prompt-details-panel
    v-model="showPromptDetails"
    :prompt-id="selectedPromptId"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineProps, defineExpose, defineEmits } from 'vue'
import { format, formatDistance } from 'date-fns'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/store/prompts'
import type { Prompt } from '@/services/prompts.service'
import PromptDetailsPanel from '@/components/PromptDetailsPanel.vue'

// Router
const router = useRouter()

// Define props
const props = defineProps({
  limit: {
    type: Number,
    default: 10
  },
  refreshable: {
    type: Boolean,
    default: true
  },
  autoRefresh: {
    type: Boolean,
    default: false
  },
  refreshInterval: {
    type: Number,
    default: 60000 // 1 minute
  },
  categoryFilter: {
    type: String,
    default: null
  }
})

// Define emits
const emit = defineEmits(['clear-filter'])

// Store
const promptStore = usePromptStore()

// State
const loading = ref(false)
let refreshTimer: number | null = null
const showPromptDetails = ref(false)
const selectedPromptId = ref<number | null>(null)

// Computed
const groupedPrompts = computed(() => {
  // Get prompts from store
  let filteredPrompts = [...promptStore.prompts]
  
  // Apply category filter if provided
  if (props.categoryFilter) {
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.promptType?.category === props.categoryFilter
    )
  }
  
  // Limit the number of prompts
  filteredPrompts = filteredPrompts.slice(0, props.limit)
  
  const grouped = {}
  
  filteredPrompts.forEach(prompt => {
    const date = format(new Date(prompt.createdAt), 'yyyy-MM-dd')
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(prompt)
  })
  
  // Sort prompts within each group by time (newest first)
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })
  
  // Convert to a sorted array of [date, prompts] pairs and then back to an object
  const sortedGroups = Object.entries(grouped)
    .sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .reduce((acc, [date, prompts]) => {
      // Use a readable date format as the key for display
      acc[format(new Date(date), 'MMM d, yyyy')] = prompts
      return acc
    }, {})
    
  return sortedGroups
})

// Methods
const fetchPrompts = async () => {
  try {
    loading.value = true
    await promptStore.fetchPrompts()
  } catch (error) {
    console.error('Error fetching prompts:', error)
  } finally {
    loading.value = false
  }
}

const refreshPrompts = () => {
  fetchPrompts()
}

const formatHeaderDate = (date: string) => {
  // Parse the formatted date string correctly
  const dateParts = date.split(' ')
  const month = dateParts[0]
  const day = parseInt(dateParts[1].replace(',', ''))
  const year = parseInt(dateParts[2])
  
  const dateObj = new Date(year, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month), day)
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (format(today, 'yyyy-MM-dd') === format(dateObj, 'yyyy-MM-dd')) {
    return 'Today'
  } else if (format(yesterday, 'yyyy-MM-dd') === format(dateObj, 'yyyy-MM-dd')) {
    return 'Yesterday'
  }
  
  return date
}

const formatTime = (dateTime: Date | string) => {
  const date = new Date(dateTime)
  return format(date, 'MMM d, yyyy • HH:mm')
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'REFUSED': return 'error'
    case 'ATTEMPTED': return 'warning'
    case 'PENDING': return 'info'
    default: return 'grey'
  }
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

const navigateToHistory = () => {
  router.push('/history')
}

const clearFilter = () => {
  emit('clear-filter')
}

// View prompt details
const viewPromptDetails = (promptId: number) => {
  selectedPromptId.value = promptId
  showPromptDetails.value = true
}

// Lifecycle
onMounted(() => {
  fetchPrompts()
  
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer = window.setInterval(() => {
      refreshPrompts()
    }, props.refreshInterval)
  }
})

onUnmounted(() => {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer)
  }
})

// Expose methods for parent components
defineExpose({
  refresh: refreshPrompts
})
</script>

<style scoped>
.date-subheader {
  background-color: rgba(var(--v-theme-primary), 0.04);
  font-weight: 500;
  font-size: 0.875rem;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.cursor-pointer {
  cursor: pointer;
}
</style> 