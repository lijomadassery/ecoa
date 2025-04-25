import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOfflineStore = defineStore('offline', () => {
  // State
  const isOffline = ref(false)
  const pendingActions = ref<any[]>([])
  const syncStatus = ref<'synced' | 'syncing' | 'error'>('synced')

  // Getters
  const hasPendingActions = computed(() => pendingActions.value.length > 0)
  const syncStatusText = computed(() => {
    switch (syncStatus.value) {
      case 'synced':
        return 'All changes synced'
      case 'syncing':
        return 'Syncing changes...'
      case 'error':
        return 'Sync failed'
      default:
        return ''
    }
  })
  const syncStatusColor = computed(() => {
    switch (syncStatus.value) {
      case 'synced':
        return 'success'
      case 'syncing':
        return 'info'
      case 'error':
        return 'error'
      default:
        return ''
    }
  })

  // Actions
  function toggleOfflineMode() {
    isOffline.value = !isOffline.value
  }

  function addPendingAction(action: any) {
    pendingActions.value.push(action)
  }

  function clearPendingActions() {
    pendingActions.value = []
  }

  async function syncPendingActions() {
    if (!hasPendingActions.value) return

    try {
      syncStatus.value = 'syncing'
      // TODO: Implement sync logic here
      await Promise.all(pendingActions.value.map(action => {
        // Process each pending action
        return Promise.resolve() // Placeholder
      }))
      clearPendingActions()
      syncStatus.value = 'synced'
    } catch (error) {
      syncStatus.value = 'error'
      throw error
    }
  }

  return {
    // State
    isOffline,
    pendingActions,
    syncStatus,

    // Getters
    hasPendingActions,
    syncStatusText,
    syncStatusColor,

    // Actions
    toggleOfflineMode,
    addPendingAction,
    clearPendingActions,
    syncPendingActions
  }
}) 