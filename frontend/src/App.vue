<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      v-if="isAuthenticated && !isAppDashboard"
      color="primary"
      elevation="1"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6 font-weight-bold">ECOA</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Offline Mode Toggle -->
      <v-btn icon class="mx-1" @click="toggleOfflineMode" :color="isOffline ? 'error' : 'default'">
        <v-icon>{{ isOffline ? 'mdi-wifi-off' : 'mdi-wifi' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ isOffline ? 'Offline Mode' : 'Online Mode' }}
        </v-tooltip>
      </v-btn>
      
      <!-- Notifications -->
      <v-btn icon class="mx-1" @click="showNotifications">
        <v-icon>mdi-bell</v-icon>
        <v-tooltip activator="parent" location="bottom">Notifications</v-tooltip>
      </v-btn>
      
      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon class="mx-1" v-bind="props">
            <v-avatar size="32" color="primary">
              <v-img
                v-if="userProfilePicture"
                :src="userProfilePicture"
                :alt="userFullName"
                cover
              />
              <span v-else class="text-subtitle-2 font-weight-bold white--text">
                {{ userInitials }}
              </span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="router.push('/profile')">
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-if="isAuthenticated && !isAppDashboard"
      v-model="drawer"
      :rail="rail"
      @click="rail = false"
      permanent
      elevation="0"
      border="0"
    >
      <!-- User Info -->
      <div class="px-2 py-3">
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="42">
                <v-img
                  v-if="userProfilePicture"
                  :src="userProfilePicture"
                  :alt="userFullName"
                  cover
                />
                <span v-else class="text-h6 font-weight-medium white--text">
                  {{ userInitials }}
                </span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-1 font-weight-medium">{{ userFullName }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">{{ userRole }}</v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                variant="text"
                :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
                @click.stop="rail = !rail"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <v-divider></v-divider>

      <!-- Navigation Items -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in filteredNavigationItems"
          :key="item.title"
          :to="item.to"
          exact
          :prepend-icon="item.icon"
          :title="item.title"
          class="my-1 nav-item"
          rounded="lg"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item
          prepend-icon="mdi-cog"
          to="/settings"
          exact
          title="Settings"
          class="nav-item"
          rounded="lg"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <!-- Use router-view with slot for both cases -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <!-- For the app dashboard view, render without container -->
          <div v-if="isAppDashboard" class="app-dashboard-wrapper">
            <component :is="Component" />
          </div>
          
          <!-- For all other views, use the standard container -->
          <v-container 
            v-else
            :class="[
              'pa-4',
              { 'px-2': $vuetify.display.smAndDown }
            ]"
            fluid
          >
            <component :is="Component" />
          </v-container>
        </transition>
      </router-view>
    </v-main>

    <!-- Offline Sync Status -->
    <v-snackbar
      v-model="showSyncStatus"
      :color="syncStatusColor"
      :timeout="3000"
      location="bottom"
    >
      {{ syncStatusText }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSyncStatus = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useOfflineStore } from '@/store/offline'
import 'vuetify/styles'
import { VApp, VAppBar, VAppBarNavIcon, VAvatar, VBtn, VContainer, VDivider, 
  VIcon, VList, VListItem, VListItemTitle, VMain, VMenu, VNavigationDrawer, 
  VSnackbar, VSpacer, VToolbarTitle, VTooltip } from 'vuetify/components'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const authStore = useAuthStore()
const offlineStore = useOfflineStore()

// State
const drawer = ref(true)
const rail = ref(false)
const showSyncStatus = ref(false)

// Navigation Items
const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Roster', icon: 'mdi-account-group', to: '/roster' },
  { title: 'Prompts', icon: 'mdi-message-text', to: '/prompts' },
  { title: 'Reports', icon: 'mdi-chart-box', to: '/reports' },
  { title: 'History', icon: 'mdi-history', to: '/history' },
  { title: 'Admin', icon: 'mdi-shield-account', to: '/admin', requiresAdmin: true }
]

// Filtered navigation items based on user role
const filteredNavigationItems = computed(() => {
  return navigationItems.filter(item => {
    // Show admin items only for admin users
    if (item.requiresAdmin) {
      return authStore.userRole === 'ADMIN';
    }
    return true;
  });
});

// Computed
const isAppDashboard = computed(() => route.name === 'AppDashboard')
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userFullName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName} ${user.lastName}` : ''
})
const userInitials = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName[0]}${user.lastName[0]}` : ''
})
const userRole = computed(() => authStore.userRole)
const userAvatar = computed(() => {
  // Replace with actual user avatar logic
  return undefined
})
const isOffline = computed(() => offlineStore.isOffline)
const syncStatusText = computed(() => offlineStore.syncStatusText)
const syncStatusColor = computed(() => offlineStore.syncStatusColor)
const userProfilePicture = computed(() => {
  const user = authStore.user
  return user?.profilePicture
})

// Methods
const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleOfflineMode = () => {
  offlineStore.toggleOfflineMode()
}

const showNotifications = () => {
  // Implement notifications logic
}
</script>

<style scoped>
.navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

/* Avatar and image styles */
.v-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.v-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Enhanced navigation item styling */
:deep(.nav-item) {
  margin: 4px 8px;
  height: 44px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

:deep(.nav-item.v-list-item--active) {
  background-color: rgb(var(--v-theme-primary));
}

:deep(.nav-item.v-list-item--active .v-list-item-title) {
  color: white;
  font-weight: 600;
}

:deep(.nav-item.v-list-item--active .v-icon) {
  color: white;
}

:deep(.v-list-item__prepend) {
  opacity: 1;
}

/* Rail mode handling */
:deep(.v-navigation-drawer--rail .v-list-item-title) {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

:deep(.v-navigation-drawer--rail .v-list-item-subtitle) {
  opacity: 0;
}

:deep(.v-navigation-drawer:not(.v-navigation-drawer--rail) .v-list-item-title) {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-dashboard-wrapper {
  height: 100%;
  width: 100%;
}
</style> 