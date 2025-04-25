<template>
  <div class="individual-details">
    <!-- App Bar -->
    <v-app-bar color="primary">
      <v-btn icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-app-bar-title>Select Prompt</v-app-bar-title>
    </v-app-bar>

    <!-- Individual Info Card -->
    <div class="pa-4">
      <v-card rounded="lg" class="mb-4">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1" size="48">
              <v-img
                v-if="individual?.profilePicture"
                :src="individual.profilePicture"
                :alt="`${individual?.firstName} ${individual?.lastName}`"
              ></v-img>
              <span v-else class="text-h6">{{ getInitials(individual?.firstName || '', individual?.lastName || '') }}</span>
            </v-avatar>
          </template>
          <v-card-title>{{ individual?.firstName }} {{ individual?.lastName }}</v-card-title>
          <v-card-subtitle>
            CDCR# {{ individual?.cdcrNumber }} • {{ individual?.housingUnit }}
          </v-card-subtitle>
        </v-card-item>
      </v-card>

      <!-- Prompt Categories -->
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 px-4 pt-4 pb-2">
          Select Prompt Category
        </v-card-title>

        <div v-if="loading" class="d-flex justify-center align-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="error" class="pa-4 text-center">
          <v-icon icon="mdi-alert-circle" color="error" size="48" class="mb-2"></v-icon>
          <div class="text-body-1 text-medium-emphasis mb-4">{{ error }}</div>
          <v-btn color="primary" @click="fetchPromptTypes">
            Try Again
          </v-btn>
        </div>

        <v-list v-else select-strategy="independent">
          <template v-for="(types, category) in groupedPromptTypes" :key="category">
            <v-list-subheader class="text-capitalize">{{ category }}</v-list-subheader>
            <v-list-item
              v-for="type in types"
              :key="type.id"
              :value="type.id"
              @click="selectPromptType(type)"
              rounded="lg"
              class="mb-1"
            >
              <template v-slot:prepend>
                <v-avatar
                  color="primary"
                  variant="tonal"
                  rounded
                  size="40"
                >
                  <v-icon :icon="getPromptIcon(type.category)" color="primary"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ type.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-truncate">
                {{ type.description }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon icon="mdi-chevron-right"></v-icon>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </div>

    <!-- Bottom Navigation -->
    <v-bottom-navigation grow color="primary" fixed>
      <v-btn @click="router.push('/roster')">
        <v-icon>mdi-account-group</v-icon>
        <span>Roster</span>
      </v-btn>
      <v-btn @click="navigateToHistory">
        <v-icon>mdi-history</v-icon>
        <span>History</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRosterStore } from '@/store/roster'
import { usePromptStore } from '@/store/prompts'
import type { Individual } from '@/types'
import type { PromptType } from '@/services/prompts.service'

const router = useRouter()
const route = useRoute()
const rosterStore = useRosterStore()
const promptStore = usePromptStore()

// State
const individual = ref<Individual | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const groupedPromptTypes = computed(() => {
  return promptStore.promptTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, PromptType[]>);
});

// Methods
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

const getPromptIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'medical': 'mdi-medical-bag',
    'meals': 'mdi-food',
    'yard': 'mdi-run',
    'visits': 'mdi-account-group',
    'programs': 'mdi-school',
    'general': 'mdi-bell',
  };
  return icons[category.toLowerCase()] || 'mdi-bell';
};

const selectPromptType = (type: PromptType) => {
  router.push({
    path: `/prompts/new/${individual.value?.id}`,
    query: { 
      promptTypeId: type.id.toString()
    }
  });
}

const navigateToHistory = () => {
  router.push('/history')
}

const fetchPromptTypes = async () => {
  try {
    loading.value = true;
    error.value = null;
    await promptStore.fetchPromptTypes();
  } catch (err) {
    error.value = 'Failed to load prompt types. Please try again.';
    console.error('Error fetching prompt types:', err);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  const id = route.params.id
  if (!id) return

  try {
    loading.value = true;
    error.value = null;
    
    // Fetch both individual and prompt types in parallel
    await Promise.all([
      (async () => {
        const data = await rosterStore.fetchIndividualById(id as string)
        individual.value = data
      })(),
      fetchPromptTypes()
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error)
    router.push('/roster')
  } finally {
    loading.value = false;
  }
})
</script>

<style scoped>
.individual-details {
  min-height: 100vh;
  padding-bottom: 56px; /* Height of bottom navigation */
  background-color: rgb(250, 250, 250);
}
</style> 