<template>
  <div class="app-dashboard">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center">
        <!-- Header -->
        <v-col cols="12" class="text-center mb-6">
          <h1 class="text-h3 font-weight-bold mb-2">Application Portal</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Welcome, {{ user?.firstName }}. Select an application to continue.
          </p>
        </v-col>

        <!-- App Grid -->
        <v-col cols="12">
          <v-row justify="center">
            <v-col v-for="app in apps" :key="app.id" cols="12" sm="6" md="4" lg="3" class="mb-4">
              <v-card
                :disabled="!app.enabled"
                class="app-card"
                height="100%"
                rounded="lg"
                :class="{ 
                  'active-app': app.enabled, 
                  'highlight-app': app.id === 'ecoa' && app.enabled 
                }"
                variant="elevated"
                @click="app.enabled ? navigateToApp(app) : null"
              >
                <div v-if="app.id === 'ecoa' && app.enabled" class="app-status active">
                  <span>Available</span>
                </div>
                <div v-if="!app.enabled" class="app-status inactive">
                  <span>Coming Soon</span>
                </div>

                <v-card-text class="d-flex flex-column align-center pa-6">
                  <div 
                    class="app-icon-container mb-4"
                    :class="{ 
                      'disabled-icon': !app.enabled,
                      'active-icon': app.id === 'ecoa' && app.enabled
                    }"
                  >
                    <v-icon :icon="app.icon" size="42"></v-icon>
                  </div>
                  
                  <h2 class="text-h5 font-weight-bold mb-1">{{ app.name }}</h2>
                  <p class="text-body-2 text-medium-emphasis text-center mb-4">{{ app.description }}</p>
                  
                  <v-btn
                    v-if="app.enabled"
                    color="primary"
                    variant="flat"
                    block
                    class="mt-auto"
                  >
                    Launch App
                  </v-btn>
                  
                  <v-btn
                    v-else
                    color="grey"
                    variant="flat"
                    block
                    disabled
                    class="mt-auto"
                  >
                    <v-icon start size="small">mdi-lock</v-icon>
                    Not Available
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// App type definition
interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  enabled: boolean;
}

// App definitions
const apps = ref<AppItem[]>([
  {
    id: 'ecoa',
    name: 'ECOA',
    description: 'Electronic Collection of Assessments',
    icon: 'mdi-clipboard-text-outline',
    route: '/dashboard',
    enabled: true
  },
  {
    id: 'ada-checklist',
    name: 'ADA Checklist',
    description: 'ADA compliance and accommodation tracking',
    icon: 'mdi-clipboard-check-outline',
    route: '#',
    enabled: false
  },
  {
    id: 'yph',
    name: 'YPH',
    description: 'Youth Program Handling',
    icon: 'mdi-account-child-outline',
    route: '#',
    enabled: false
  },
  {
    id: 'arhr',
    name: 'ARHR',
    description: 'Advanced Record Handling & Reports',
    icon: 'mdi-file-document-outline',
    route: '#',
    enabled: false
  },
  {
    id: 'cell-search',
    name: 'Cell Search',
    description: 'Cell search tracking and documentation',
    icon: 'mdi-magnify',
    route: '#',
    enabled: false
  },
  {
    id: 'cdrem',
    name: 'CDREM',
    description: 'CD Records & Evidence Management',
    icon: 'mdi-folder-outline',
    route: '#',
    enabled: false
  },
  {
    id: 'evidence-management',
    name: 'Evidence Management',
    description: 'Track and manage evidence collection',
    icon: 'mdi-briefcase-outline',
    route: '#',
    enabled: false
  }
])

// Navigate to selected app
const navigateToApp = (app: AppItem) => {
  if (app.enabled && app.route) {
    router.push(app.route)
  }
}
</script>

<style scoped>
.app-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%);
  padding: 2rem 0;
}

.app-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.app-status {
  position: absolute;
  top: 15px;
  right: -35px;
  padding: 5px 40px;
  font-size: 12px;
  font-weight: bold;
  transform: rotate(45deg);
  z-index: 2;
  color: white;
}

.app-status.active {
  background-color: #4caf50;
}

.app-status.inactive {
  background-color: #9e9e9e;
}

.app-icon-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.active-icon {
  background-color: rgba(var(--v-theme-primary), 0.2);
  transform: scale(1.05);
}

.disabled-icon {
  opacity: 0.5;
  filter: grayscale(70%);
}

.active-app {
  cursor: pointer;
}

.active-app:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.highlight-app {
  border: 2px solid rgba(var(--v-theme-primary), 0.7);
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.15);
}

.highlight-app:hover {
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.25);
}
</style> 