<template>
  <div class="prompts-view">
    <v-container class="py-4">
      <!-- Header Section -->
      <v-row class="mb-8">
        <v-col cols="12" class="d-flex align-center">
          <div>
            <h1 class="text-h4 font-weight-medium mb-1">Prompts</h1>
            <div class="text-subtitle-1 text-medium-emphasis">Select a prompt type to create a new prompt</div>
          </div>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="promptStore.loading" class="d-flex justify-center align-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="d-flex flex-column align-center py-12">
        <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4"></v-icon>
        <div class="text-h6 text-medium-emphasis mb-4">{{ error }}</div>
        <v-btn 
          color="primary" 
          prepend-icon="mdi-refresh"
          @click="fetchPromptTypes"
        >
          Try Again
        </v-btn>
      </div>

      <!-- Prompt Categories -->
      <template v-else>
        <v-row v-for="promptType in groupedPromptTypes" :key="promptType.category" class="mb-8">
          <v-col cols="12">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-format-list-group" class="mr-2" color="primary"></v-icon>
              <h2 class="text-h5 font-weight-medium text-capitalize">{{ promptType.category }}</h2>
            </div>
            
            <v-row>
              <v-col 
                v-for="type in promptType.types" 
                :key="type.id" 
                cols="12" 
                sm="6" 
                md="4"
                lg="3"
              >
                <v-card
                  @click="navigateToRoster(type.id)"
                  class="prompt-card h-100"
                  elevation="2"
                  rounded="lg"
                  hover
                >
                  <v-card-item>
                    <template v-slot:prepend>
                      <v-avatar
                        color="primary"
                        variant="tonal"
                        rounded
                        size="48"
                        class="mb-2"
                      >
                        <v-icon size="24" color="primary">{{ getPromptIcon(type.category) }}</v-icon>
                      </v-avatar>
                    </template>
                    <v-card-title class="text-h6 font-weight-medium mb-2">{{ type.name }}</v-card-title>
                    <v-card-subtitle class="text-body-2">
                      {{ type.description }}
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-actions class="pa-4 pt-0">
                    <v-btn
                      variant="tonal"
                      color="primary"
                      block
                      prepend-icon="mdi-plus"
                      @click.stop="navigateToRoster(type.id)"
                    >
                      Create Prompt
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePromptStore } from '@/store/prompts';

const router = useRouter();
const promptStore = usePromptStore();
const error = ref<string | null>(null);

// Computed
const groupedPromptTypes = computed(() => {
  const grouped = promptStore.promptTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = {
        category: type.category,
        types: []
      };
    }
    acc[type.category].types.push(type);
    return acc;
  }, {} as Record<string, { category: string; types: typeof promptStore.promptTypes }>);

  return Object.values(grouped);
});

// Methods
const navigateToRoster = (typeId: number) => {
  router.push({
    path: '/roster',
    query: { promptTypeId: typeId.toString() }
  });
};

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

const fetchPromptTypes = async () => {
  try {
    error.value = null;
    await promptStore.fetchPromptTypes();
  } catch (err) {
    error.value = 'Failed to load prompt types. Please try again.';
  }
};

// Lifecycle
onMounted(() => {
  fetchPromptTypes();
});
</script>

<style scoped>
.prompts-view {
  min-height: 100vh;
  background-color: rgb(250, 250, 250);
}

.prompt-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.prompt-card:hover {
  transform: translateY(-4px);
}

.v-card-item {
  padding: 24px;
}
</style> 