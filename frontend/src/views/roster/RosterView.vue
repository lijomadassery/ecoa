<template>
  <div class="roster-view">
    <!-- Search Bar -->
    <v-card flat class="mb-2 mx-2">
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Search by name or CDCR#"
        variant="outlined"
        density="comfortable"
        hide-details
        class="rounded-pill"
        @update:model-value="handleSearch"
      ></v-text-field>
    </v-card>

    <!-- Filter Tabs -->
    <v-card flat class="mx-2 mb-2">
      <v-tabs
        v-model="selectedUnit"
        color="primary"
        grow
        slider-color="primary"
      >
        <v-tab value="all">All</v-tab>
        <v-tab value="unit1">Unit 1</v-tab>
        <v-tab value="unit2">Unit 2</v-tab>
      </v-tabs>
    </v-card>

    <!-- Roster List -->
    <v-container class="pa-2">
      <div v-if="rosterStore.loading" class="d-flex justify-center align-center py-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <v-alert
        v-if="rosterStore.error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
      >
        {{ rosterStore.error }}
      </v-alert>

      <div v-else-if="filteredIndividuals.length === 0" class="text-center py-4">
        <v-icon icon="mdi-account-search" size="48" color="grey-lighten-1" class="mb-2"></v-icon>
        <div class="text-body-1 text-medium-emphasis">No individuals found</div>
      </div>

      <v-row v-else>
        <v-col cols="12" v-for="individual in filteredIndividuals" :key="individual.id">
          <v-card
            @click="navigateToDetails(individual.id)"
            class="mb-2"
            elevation="1"
            rounded="lg"
          >
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-1" size="48">
                  <span class="text-h6">{{ getInitials(individual.firstName, individual.lastName) }}</span>
                </v-avatar>
              </template>

              <v-card-title>
                {{ individual.firstName }} {{ individual.lastName }}
              </v-card-title>

              <v-card-subtitle>
                CDCR# {{ individual.cdcrNumber }} • {{ individual.housingUnit }}
              </v-card-subtitle>

              <template v-slot:append>
                <v-btn
                  icon="mdi-information"
                  variant="text"
                  color="primary"
                  class="me-1"
                  @click.stop="showIndividualDetails(individual.id)"
                ></v-btn>
                <v-btn
                  icon="mdi-chevron-right"
                  variant="text"
                  color="primary"
                ></v-btn>
              </template>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Individual Details Modal -->
    <individual-details-modal
      v-model="showDetailsModal"
      :individual-id="selectedIndividualId"
    />

    <!-- Bottom Navigation -->
    <v-bottom-navigation grow color="primary">
      <v-btn>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOfflineStore } from '@/store/offline'
import { useRosterStore } from '@/store/roster'
import { usePromptStore } from '@/store/prompts'
import { useToast } from 'vue-toastification'
import type { Individual } from '@/types'
import { debounce } from 'lodash'
import IndividualDetailsModal from '@/components/IndividualDetailsModal.vue'

const router = useRouter()
const route = useRoute()
const offlineStore = useOfflineStore()
const rosterStore = useRosterStore()
const promptStore = usePromptStore()
const toast = useToast()

// State
const searchQuery = ref('')
const selectedUnit = ref('all')
const showDetailsModal = ref(false)
const selectedIndividualId = ref<string | null>(null)

// Get the prompt type ID from the route
const promptTypeId = computed(() => {
  const id = route.query.promptTypeId;
  return id ? parseInt(id as string) : null;
});

// Get the selected prompt type
const selectedPromptType = computed(() => {
  if (!promptTypeId.value) return null;
  return promptStore.promptTypes.find(type => type.id === promptTypeId.value);
});

// Computed
const filteredIndividuals = computed(() => {
  let filtered = rosterStore.individuals

  // Filter by unit
  if (selectedUnit.value !== 'all') {
    filtered = rosterStore.getIndividualsByUnit(selectedUnit.value)
  }

  return filtered
})

// Methods
const handleSearch = debounce(async () => {
  if (searchQuery.value.length >= 2) {
    await rosterStore.searchIndividuals(searchQuery.value)
  } else if (searchQuery.value.length === 0) {
    await rosterStore.fetchIndividuals()
  }
}, 300)

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

const navigateToDetails = (id: string) => {
  const promptTypeId = route.query.promptTypeId;
  
  if (promptTypeId) {
    // If we have a promptTypeId, go directly to signature capture
    router.push({
      path: `/prompts/new/${id}`,
      query: { promptTypeId }
    });
  } else {
    // Otherwise, go to individual details
    router.push(`/roster/${id}`);
  }
}

const showIndividualDetails = (id: string) => {
  selectedIndividualId.value = id;
  showDetailsModal.value = true;
}

const navigateToHistory = () => {
  router.push('/history')
}

// Update the createPrompt method to handle string IDs
const createPrompt = async (individual: Individual) => {
  if (!promptTypeId.value) {
    console.error('No prompt type ID provided');
    return;
  }

  try {
    await promptStore.createPrompt({
      individualId: parseInt(individual.id),
      promptTypeId: promptTypeId.value,
      status: 'PENDING',
      notes: '',
      location: individual.housingUnit,
      deviceId: 'web'
    });
    // Show success message
    toast.success(`Created ${selectedPromptType.value?.name} prompt for ${individual.firstName} ${individual.lastName}`);
  } catch (error) {
    // Show error message
    toast.error('Failed to create prompt');
  }
};

// Lifecycle
onMounted(async () => {
  const promptTypeIdParam = route.query.promptTypeId;
  const individualIdParam = route.query.individualId;
  
  // If both promptTypeId and individualId are provided, go directly to signature capture
  if (promptTypeIdParam && individualIdParam) {
    router.push({
      path: `/prompts/new/${individualIdParam}`,
      query: { promptTypeId: promptTypeIdParam }
    });
    return;
  }
  
  // Load roster data
  if (promptStore.promptTypes.length === 0) {
    await promptStore.fetchPromptTypes();
  }
  await rosterStore.fetchIndividuals();
})
</script>

<style scoped>
.roster-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.v-container {
  flex: 1;
  overflow-y: auto;
}

.v-card-item {
  padding: 12px;
}
</style> 