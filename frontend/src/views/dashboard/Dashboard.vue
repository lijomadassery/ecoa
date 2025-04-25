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
        <ActivityFeed 
          :limit="10"
          :refreshable="true"
          :auto-refresh="false"
        />
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
import ActivityFeed from '@/components/ActivityFeed.vue'
import { usePromptStore } from '@/store/prompts'

const router = useRouter()
const authStore = useAuthStore()
const offlineStore = useOfflineStore()
const promptStore = usePromptStore()

// Computed
const isOffline = computed(() => offlineStore.isOffline)

// Mock data - Replace with API calls later
const stats = ref({
  todayPrompts: 24,
  pendingPrompts: 8,
  completionRate: 92,
  activeIndividuals: 156
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
</style> 