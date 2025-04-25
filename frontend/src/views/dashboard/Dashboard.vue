<template>
  <div class="dashboard">
    <!-- Stats Grid -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Today's Prompts</v-card-title>
            <div class="d-flex align-center mt-2">
              <div class="text-h4">{{ stats.todayPrompts }}</div>
              <v-chip
                size="small"
                color="primary"
                class="ml-2"
              >
                {{ stats.pendingPrompts }} pending
              </v-chip>
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Completion Rate</v-card-title>
            <div class="d-flex align-center mt-2">
              <div class="text-h4">{{ stats.completionRate }}%</div>
              <span class="text-caption text-medium-emphasis ml-2">
                Last 7 days
              </span>
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-item>
            <v-card-title class="text-subtitle-1">Active Individuals</v-card-title>
            <div class="d-flex align-center mt-2">
              <div class="text-h4">{{ stats.activeIndividuals }}</div>
              <span class="text-caption text-medium-emphasis ml-2">
                In your facility
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
              <span class="text-body-1">
                {{ isOffline ? 'Offline' : 'Online' }}
              </span>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Recent Activity -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="d-flex align-center px-4 py-3">
            <span class="text-h6">Recent Activity</span>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="primary"
              @click="navigateToHistory"
              class="text-none"
            >
              View All
              <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>

          <v-list lines="two">
            <template v-if="isLoading">
              <v-list-item v-for="n in 3" :key="n">
                <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item
                v-for="activity in recentActivity"
                :key="activity.id"
                :subtitle="new Date(activity.createdAt).toLocaleString()"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getActivityStatus(activity)"
                    size="40"
                  >
                    <v-img
                      v-if="activity.user?.profilePicture"
                      :src="activity.user.profilePicture"
                      :alt="activity.user?.firstName"
                    />
                    <span v-else class="text-caption white--text">
                      {{ activity.user ? `${activity.user.firstName[0]}${activity.user.lastName[0]}` : 'U' }}
                    </span>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'Unknown User' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatActivityAction(activity) }}
                  <v-chip
                    :color="getActivityStatus(activity)"
                    size="x-small"
                    class="ms-2"
                    variant="tonal"
                  >
                    {{ activity.entityType }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card rounded="lg">
          <v-card-title class="px-4 py-3 text-h6">
            Quick Actions
          </v-card-title>

          <v-card-text class="pt-2">
            <v-row>
              <v-col cols="12">
                <v-btn
                  block
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-account-plus"
                  class="mb-3"
                  @click="navigateToNewPrompt"
                >
                  New Prompt
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-account-group"
                  class="mb-3"
                  @click="navigateToRoster"
                >
                  View Roster
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-history"
                  @click="navigateToHistory"
                >
                  View History
                </v-btn>
              </v-col>
            </v-row>
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
import { ActivityService, type ActivityLog } from '@/services/activity.service'

const router = useRouter()
const authStore = useAuthStore()
const offlineStore = useOfflineStore()

// State
const recentActivity = ref<ActivityLog[]>([])
const isLoading = ref(false)

// Computed
const isOffline = computed(() => offlineStore.isOffline)

// Mock data - Replace with API calls later
const stats = ref({
  todayPrompts: 24,
  pendingPrompts: 8,
  completionRate: 92,
  activeIndividuals: 156
})

// Methods
const fetchRecentActivity = async () => {
  try {
    isLoading.value = true
    recentActivity.value = await ActivityService.getRecentActivity(10)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
  } finally {
    isLoading.value = false
  }
}

const formatActivityAction = (activity: ActivityLog): string => {
  const actionMap: Record<string, string> = {
    'LOGIN': 'Logged in',
    'LOGOUT': 'Logged out',
    'PROMPT_DELIVERED': 'Delivered prompt',
    'MEMORY_BANK_CREATED': 'Created memory bank entry'
  }
  return actionMap[activity.action] || activity.action
}

const getActivityStatus = (activity: ActivityLog): string => {
  switch (activity.action) {
    case 'LOGIN':
      return 'success'
    case 'LOGOUT':
      return 'error'
    case 'PROMPT_DELIVERED':
      return 'info'
    default:
      return 'primary'
  }
}

// Lifecycle
onMounted(() => {
  fetchRecentActivity()
})

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
</script>

<style scoped>
.dashboard {
  min-height: 100%;
}

.v-card {
  height: 100%;
}

.v-list-item {
  padding: 12px 16px;
}

.v-avatar {
  border: 2px solid transparent;
}

.v-avatar img {
  object-fit: cover;
}
</style> 