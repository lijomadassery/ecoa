<template>
  <div class="dashboard">
    <!-- Stats Grid -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Today's Prompts</v-card-title>
            <div v-if="isLoading">
              <v-skeleton-loader type="text" class="mt-2"></v-skeleton-loader>
            </div>
            <div v-else class="d-flex align-center mt-2">
              <div class="text-h4">{{ stats.todayPrompts }}</div>
              <v-chip
                size="small"
                color="info"
                class="ml-2"
              >
                {{ todayStats.pendingPrompts }} pending
              </v-chip>
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Today's Prompt Status</v-card-title>
            <div v-if="isLoading">
              <v-skeleton-loader type="text" class="mt-2"></v-skeleton-loader>
            </div>
            <div v-else class="d-flex justify-space-between align-center mt-2">
              <div class="status-indicator">
                <v-icon color="success" size="24">mdi-check-circle</v-icon>
                <div class="text-body-1">{{ todayStats.completedPrompts }}</div>
                <div class="text-caption">Completed</div>
              </div>
              <div class="status-indicator">
                <v-icon color="warning" size="24">mdi-alert-circle</v-icon>
                <div class="text-body-1">{{ todayStats.attemptedPrompts }}</div>
                <div class="text-caption">Attempted</div>
              </div>
              <div class="status-indicator">
                <v-icon color="error" size="24">mdi-close-circle</v-icon>
                <div class="text-body-1">{{ todayStats.refusedPrompts }}</div>
                <div class="text-caption">Refused</div>
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Today's Completion Rate</v-card-title>
            <div v-if="isLoading">
              <v-skeleton-loader type="image" class="mt-2"></v-skeleton-loader>
            </div>
            <div v-else class="d-flex align-center mt-2">
              <div class="completion-rate">
                <v-progress-circular
                  :model-value="todayStats.completionRate"
                  color="primary"
                  :size="60"
                  :width="8"
                >
                  <div class="text-body-1 font-weight-bold">{{ todayStats.completionRate }}%</div>
                </v-progress-circular>
              </div>
              <span class="text-caption text-medium-emphasis ml-3">
                Today<br>
                {{ todayStats.totalPrompts }} prompts
              </span>
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Sync Status</v-card-title>
            <div class="d-flex align-center mt-2">
              <v-icon
                :color="isOffline ? 'error' : 'success'"
                size="32"
                class="mr-2"
              >
                {{ isOffline ? 'mdi-wifi-off' : 'mdi-wifi' }}
              </v-icon>
              <div>
                <div class="text-body-1">
                  {{ isOffline ? 'Offline' : 'Online' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ isOffline ? 'Data will sync when connection is restored' : 'Data syncing normally' }}
                </div>
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Recent Activity -->
      <v-col cols="12" lg="8">
        <ActivityFeed 
          :limit="8"
          :refreshable="true"
          :auto-refresh="false"
          :category-filter="selectedCategory"
          @clear-filter="clearCategoryFilter"
        />
      </v-col>

      <!-- Quick Actions & Prompt Categories -->
      <v-col cols="12" lg="4">
        <!-- Prompt Categories -->
        <v-card rounded="lg" class="mb-4 card-compact">
          <v-card-title class="px-4 py-2 text-h6">
            Prompt Categories
          </v-card-title>
          
          <div v-if="isLoading" class="pa-2">
            <v-skeleton-loader 
              type="list-item-avatar, list-item-avatar, list-item-avatar, list-item-avatar, list-item-avatar"
              class="pa-0"
            ></v-skeleton-loader>
          </div>
          
          <v-list v-else density="compact" class="py-0">
            <v-list-item v-for="category in promptCategories" :key="category.name" density="compact" class="py-1"
                           @click="filterByCategory(category.name)"
                           :class="{ 'category-selected': selectedCategory === category.name }"
                           style="cursor: pointer">
              <template v-slot:prepend>
                <v-avatar
                  color="primary"
                  size="28"
                  variant="tonal"
                  rounded
                >
                  <v-icon :icon="category.icon" size="14" color="primary"></v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="text-body-2">{{ category.name }}</v-list-item-title>
              
              <template v-slot:append>
                <v-chip
                  size="x-small"
                  color="grey-lighten-3"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ category.count }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        
        <!-- Quick Actions -->
        <v-card rounded="lg" class="card-compact">
          <v-card-title class="px-4 py-2 text-h6">
            Quick Actions
          </v-card-title>

          <v-card-text class="pt-1 pb-2 px-4">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-clipboard-text-outline"
                size="small"
                density="comfortable"
                @click="navigateToNewPrompt"
                class="flex-grow-1"
              >
                New Prompt
              </v-btn>
              
              <v-btn
                variant="tonal"
                color="primary"
                prepend-icon="mdi-account-group"
                size="small"
                density="comfortable"
                @click="navigateToRoster"
                class="flex-grow-1"
              >
                View Roster
              </v-btn>
              
              <v-btn
                variant="tonal"
                color="primary"
                prepend-icon="mdi-history"
                size="small"
                density="comfortable"
                @click="navigateToHistory"
                class="flex-grow-1"
              >
                View History
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useOfflineStore } from '@/store/offline'
import ActivityFeed from '@/components/ActivityFeed.vue'
import { usePromptStore } from '@/store/prompts'

const router = useRouter()
const authStore = useAuthStore()
const offlineStore = useOfflineStore()
const promptStore = usePromptStore()
const selectedCategory = ref<string | null>(null)

// Add loading state
const isLoading = ref(true)

// Computed
const isOffline = computed(() => offlineStore.isOffline)

// Calculate stats from real data
const stats = computed(() => {
  const allPrompts = promptStore.prompts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get today's prompts
  const todayPrompts = allPrompts.filter(prompt => {
    const promptDate = new Date(prompt.createdAt)
    promptDate.setHours(0, 0, 0, 0)
    return promptDate.getTime() === today.getTime()
  })
  
  // Get pending prompts
  const pendingPrompts = allPrompts.filter(prompt => prompt.status === 'PENDING')
  
  // Get completed, attempted, and refused prompts
  const completedPrompts = allPrompts.filter(prompt => prompt.status === 'COMPLETED')
  const attemptedPrompts = allPrompts.filter(prompt => prompt.status === 'ATTEMPTED')
  const refusedPrompts = allPrompts.filter(prompt => prompt.status === 'REFUSED')
  
  // Calculate completion rate (completed / total)
  const nonPendingPrompts = allPrompts.filter(prompt => prompt.status !== 'PENDING')
  const completionRate = nonPendingPrompts.length > 0 
    ? Math.round((completedPrompts.length / nonPendingPrompts.length) * 100) 
    : 0
  
  // Get prompts from last 7 days
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  lastWeek.setHours(0, 0, 0, 0)
  const weekPrompts = allPrompts.filter(prompt => {
    const promptDate = new Date(prompt.createdAt)
    return promptDate >= lastWeek
  })
  
  return {
    todayPrompts: todayPrompts.length,
    pendingPrompts: pendingPrompts.length,
    completedPrompts: completedPrompts.length,
    attemptedPrompts: attemptedPrompts.length,
    refusedPrompts: refusedPrompts.length,
    completionRate: completionRate,
    totalWeekPrompts: weekPrompts.length,
    activeIndividuals: [...new Set(allPrompts.map(prompt => prompt.individualId))].length
  }
})

// Calculate today's stats
const todayStats = computed(() => {
  const allPrompts = promptStore.prompts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get today's prompts
  const todayPrompts = allPrompts.filter(prompt => {
    const promptDate = new Date(prompt.createdAt)
    promptDate.setHours(0, 0, 0, 0)
    return promptDate.getTime() === today.getTime()
  })
  
  // Get today's prompts by status
  const todayCompletedPrompts = todayPrompts.filter(prompt => prompt.status === 'COMPLETED')
  const todayAttemptedPrompts = todayPrompts.filter(prompt => prompt.status === 'ATTEMPTED')
  const todayRefusedPrompts = todayPrompts.filter(prompt => prompt.status === 'REFUSED')
  const todayPendingPrompts = todayPrompts.filter(prompt => prompt.status === 'PENDING')
  
  // Calculate today's completion rate (completed / non-pending)
  const todayNonPendingPrompts = todayPrompts.filter(prompt => prompt.status !== 'PENDING')
  const todayCompletionRate = todayNonPendingPrompts.length > 0
    ? Math.round((todayCompletedPrompts.length / todayNonPendingPrompts.length) * 100)
    : 0
  
  return {
    totalPrompts: todayPrompts.length,
    completedPrompts: todayCompletedPrompts.length,
    attemptedPrompts: todayAttemptedPrompts.length,
    refusedPrompts: todayRefusedPrompts.length,
    pendingPrompts: todayPendingPrompts.length,
    completionRate: todayCompletionRate
  }
})

// Calculate prompt categories from real data
const promptCategories = computed(() => {
  const categories = new Map()
  
  // Group by prompt type categories
  promptStore.promptTypes.forEach(type => {
    if (!categories.has(type.category)) {
      categories.set(type.category, {
        name: type.category,
        count: 0,
        icon: getCategoryIcon(type.category),
        color: getCategoryColor(type.category)
      })
    }
  })
  
  // Count prompts in each category
  promptStore.prompts.forEach(prompt => {
    const category = prompt.promptType?.category
    if (category && categories.has(category)) {
      const current = categories.get(category)
      current.count++
      categories.set(category, current)
    }
  })
  
  return Array.from(categories.values())
})

// Helper functions for category icons and colors
const getCategoryIcon = (category: string): string => {
  const icons = {
    'medical': 'mdi-medical-bag',
    'meals': 'mdi-food',
    'yard': 'mdi-run',
    'visits': 'mdi-account-group',
    'programs': 'mdi-school',
    'general': 'mdi-bell'
  }
  
  return icons[category.toLowerCase()] || 'mdi-shape'
}

const getCategoryColor = (category: string): string => {
  const colors = {
    'Medical': 'red',
    'Meals': 'orange',
    'Yard': 'green', 
    'Visits': 'blue',
    'Programs': 'purple'
  }
  
  return colors[category] || 'grey'
}

// Navigation methods
const navigateToRoster = () => {
  router.push('/roster')
}

const navigateToHistory = () => {
  router.push('/history')
}

const navigateToNewPrompt = () => {
  // Navigate to roster page first since we need to select an individual
  router.push('/roster')
}

// In a real application, we would calculate these stats from API data
const calculateStats = async () => {
  try {
    // This is now handled by the computed stats property
  } catch (error) {
    console.error('Error calculating stats:', error)
  }
}

// Calculate prompt category counts
const calculatePromptCategories = async () => {
  try {
    // This is now handled by the computed promptCategories property
  } catch (error) {
    console.error('Error calculating prompt categories:', error)
  }
}

const filterByCategory = (category: string) => {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

const clearCategoryFilter = () => {
  selectedCategory.value = null
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      promptStore.fetchPromptTypes(),
      promptStore.fetchPrompts()
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100%;
}

.v-card {
  height: 100%;
}

.status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.completion-rate {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-compact {
  height: auto !important;
}

.gap-2 {
  gap: 8px;
}

.v-list-item.py-1 {
  min-height: 36px;
}

.category-selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style> 