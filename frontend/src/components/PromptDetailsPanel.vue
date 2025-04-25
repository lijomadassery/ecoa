<template>
  <div v-if="isOpen" class="details-overlay">
    <div class="details-panel" ref="panelRef">
      <v-toolbar color="primary" dark class="px-2">
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Prompt Details</v-toolbar-title>
      </v-toolbar>

      <div v-if="loading" class="d-flex justify-center align-center pa-6">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="!prompt" class="d-flex justify-center align-center pa-6">
        <div class="text-center">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="grey"></v-icon>
          <div class="text-body-1 mt-2">Prompt details not available</div>
        </div>
      </div>

      <v-container v-else class="px-4 py-4 panel-content">
        <!-- Individual Info Section -->
        <div class="d-flex align-center mb-4">
          <v-avatar color="grey-lighten-3" size="48" class="mr-3">
            <v-img
              v-if="prompt.individual.profilePicture"
              :src="prompt.individual.profilePicture"
              :alt="`${prompt.individual.firstName} ${prompt.individual.lastName}`"
            ></v-img>
            <span v-else class="text-body-1">{{ getInitials(prompt.individual.firstName, prompt.individual.lastName) }}</span>
          </v-avatar>
          <div>
            <div class="text-h6">{{ prompt.individual.firstName }} {{ prompt.individual.lastName }}</div>
            <div class="text-caption">CDCR# {{ prompt.individual.cdcrNumber }}</div>
          </div>
        </div>

        <v-divider class="mb-4"></v-divider>

        <!-- Prompt Status Section -->
        <div class="d-flex align-center mb-4">
          <v-chip
            :color="getStatusColor(prompt.status)"
            size="small"
            variant="elevated"
            class="text-capitalize mr-2"
          >
            {{ prompt.status.toLowerCase() }}
          </v-chip>
          <span class="text-body-2">{{ formatDateTime(prompt.createdAt) }}</span>
        </div>

        <!-- Prompt Type & Category -->
        <v-card variant="outlined" class="mb-4" rounded="lg">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" rounded size="36">
                <v-icon :icon="getPromptIcon(prompt.promptType.category)" color="primary"></v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1">{{ prompt.promptType.name }}</v-card-title>
            <v-card-subtitle>{{ prompt.promptType.category }}</v-card-subtitle>
          </v-card-item>
        </v-card>

        <!-- Officer Details -->
        <div class="mb-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Officer Details</div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-account-tie" color="primary" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                {{ prompt.user.firstName }} {{ prompt.user.lastName }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-badge-account" color="primary" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                Badge # {{ prompt.user.badgeNumber }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Notes Section (if available) -->
        <div v-if="prompt.notes" class="mb-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Notes</div>
          <v-card variant="outlined" rounded="lg" class="pa-3 bg-grey-lighten-5">
            <div class="text-body-2">{{ prompt.notes }}</div>
          </v-card>
        </div>

        <!-- Signature Section (if available) -->
        <div v-if="prompt.signatureData" class="mb-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Signature</div>
          <v-card variant="outlined" rounded="lg" class="pa-3 d-flex justify-center">
            <img :src="prompt.signatureData" alt="Signature" class="signature-image" />
          </v-card>
        </div>

        <!-- Device & Location Details -->
        <div class="mb-2">
          <div class="text-subtitle-1 font-weight-medium mb-2">Additional Details</div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-map-marker" color="primary" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                Location: {{ prompt.location }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-tablet" color="primary" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                Device ID: {{ prompt.deviceId }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { format } from 'date-fns'
import { usePromptStore } from '@/store/prompts'
import type { Prompt } from '@/services/prompts.service'

const props = defineProps<{
  modelValue: boolean;
  promptId: number | null;
}>()

const emit = defineEmits(['update:modelValue'])

// State
const loading = ref(false)
const panelRef = ref<HTMLElement | null>(null)

// Store
const promptStore = usePromptStore()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const prompt = computed(() => {
  if (!props.promptId) return null
  return promptStore.prompts.find(p => p.id === props.promptId) || null
})

// Methods
const close = () => {
  isOpen.value = false
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

const formatDateTime = (dateTime: Date | string) => {
  const date = new Date(dateTime)
  return format(date, 'MMM d, yyyy • HH:mm')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'REFUSED':
      return 'error'
    case 'ATTEMPTED':
      return 'warning'
    default:
      return 'grey'
  }
}

const getPromptIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'medical': 'mdi-medical-bag',
    'meals': 'mdi-food',
    'yard': 'mdi-run',
    'visits': 'mdi-account-group',
    'programs': 'mdi-school',
    'general': 'mdi-bell',
  }
  return icons[category.toLowerCase()] || 'mdi-bell'
}

// Position the panel at the current scroll position when it opens
watch(() => isOpen.value, async (newValue) => {
  if (newValue) {
    // Wait for panel to be rendered
    await nextTick()
    if (panelRef.value) {
      // Position the panel to be in view
      const rect = panelRef.value.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // If the panel would overflow the bottom of the viewport, adjust its position
      if (rect.height > viewportHeight * 0.8) {
        // If panel is too tall, set a max height and allow scrolling within panel
        panelRef.value.style.maxHeight = `${viewportHeight * 0.8}px`
        panelRef.value.style.top = '10vh'
      } else {
        // Center the panel vertically in the visible portion of the viewport
        panelRef.value.style.top = `${Math.max(10, ((viewportHeight - rect.height) / 2))}px`
      }
    }
  }
})
</script>

<style scoped>
.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  overflow: auto;
}

.details-panel {
  position: relative;
  width: 90%;
  max-width: 450px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  animation: slide-in 0.3s ease;
}

.panel-content {
  overflow-y: auto;
}

.signature-image {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .details-panel {
    width: 95%;
    max-height: 90vh;
  }
}
</style> 