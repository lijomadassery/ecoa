<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <div>Recent Activity</div>
      <v-spacer></v-spacer>
      <v-btn
        v-if="refreshable"
        icon="mdi-refresh"
        size="small"
        variant="text"
        @click="fetchActivities"
        :loading="loading"
      ></v-btn>
    </v-card-title>
    <v-card-text>
      <v-timeline side="end" align="start" density="compact">
        <v-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          size="small"
          dot-color="primary"
        >
          <div class="d-flex align-center mb-1">
            <div class="text-caption text-grey">
              {{ formatDate(activity.createdAt) }}
            </div>
            <v-spacer></v-spacer>
            <v-chip
              :color="getActivityStatus(activity)"
              size="small"
              class="text-uppercase"
            >
              {{ activity.entityType }}
            </v-chip>
          </div>
          <div class="text-subtitle-2 mb-1">{{ getActivityTitle(activity) }}</div>
          <div class="text-body-2 text-grey">{{ getActivityDescription(activity) }}</div>
        </v-timeline-item>
        <v-timeline-item v-if="loading && !activities.length" size="small">
          <div class="text-center py-2">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </div>
        </v-timeline-item>
        <v-timeline-item v-if="!loading && !activities.length" size="small">
          <div class="text-center py-2 text-grey">No recent activity</div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineExpose } from 'vue'
import { ActivityService, type ActivityLog } from '@/services/activity.service'
import { format, formatDistance } from 'date-fns'

// Define props
const props = defineProps({
  limit: {
    type: Number,
    default: 5
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
  }
})

// State
const activities = ref<ActivityLog[]>([])
const loading = ref(false)
let refreshTimer: number | null = null

// Methods
const fetchActivities = async () => {
  try {
    loading.value = true
    activities.value = await ActivityService.getRecentActivity(props.limit)
  } catch (error) {
    console.error('Error fetching activities:', error)
  } finally {
    loading.value = false
  }
}

const refreshActivities = () => {
  fetchActivities()
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // If within the last 24 hours, show as "2 hours ago" format
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistance(date, now, { addSuffix: true });
    }
    
    // Otherwise, show as "Jan 15, 2023" format
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

const getActivityStatus = (activity: ActivityLog): string => {
  // For prompt activities, use the status color
  if (activity.entityType === 'PROMPT' && activity.detailedInfo) {
    const { status } = activity.detailedInfo
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'REFUSED': return 'error'
      case 'ATTEMPTED': return 'warning'
      default: return 'info'
    }
  }
  
  // For other activities, use the action type
  const typeColorMap: Record<string, string> = {
    'VIEW': 'info',
    'CREATE': 'success',
    'UPDATE': 'warning',
    'DELETE': 'error',
    'LOGIN': 'success',
    'LOGOUT': 'error',
    'SYSTEM': 'secondary'
  }
  
  return typeColorMap[activity.action] || 'primary'
}

const getActivityTitle = (activity: ActivityLog): string => {
  if (!activity) return 'Unknown activity';
  
  if (activity.entityType === 'PROMPT' && activity.detailedInfo) {
    return `Prompt: ${activity.detailedInfo.promptType?.name || 'Unknown'}`;
  } else if (activity.entityType === 'AUTH') {
    return `${activity.action}: ${activity.detailedInfo?.username || 'Unknown user'}`;
  } else {
    return `${activity.action || 'Unknown'} ${activity.entityType || 'Action'}`;
  }
}

const getActivityDescription = (activity: ActivityLog): string => {
  if (!activity) return '';
  
  if (activity.entityType === 'PROMPT' && activity.detailedInfo) {
    const individual = activity.detailedInfo.individual;
    if (individual) {
      return `${individual.firstName || ''} ${individual.lastName || ''} ${individual.cdcrNumber ? `(${individual.cdcrNumber})` : ''}`.trim();
    }
    return 'Unknown individual';
  } else if (activity.entityType === 'AUTH') {
    return activity.detailedInfo?.message || '';
  }
  
  return activity.description || '';
}

// Lifecycle
onMounted(() => {
  fetchActivities()
  
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer = window.setInterval(() => {
      refreshActivities()
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
  refresh: refreshActivities
})
</script>

<style scoped>
.v-timeline-item {
  margin-bottom: 8px;
}
</style> 