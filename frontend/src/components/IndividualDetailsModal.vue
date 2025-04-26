<template>
  <v-dialog v-model="showDialog" width="400" max-width="95vw">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4">
        Individual Details
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="close"></v-btn>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-4">
        <v-row v-if="loading">
          <v-col cols="12" class="d-flex justify-center align-center py-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-col>
        </v-row>
        
        <v-row v-else-if="error">
          <v-col cols="12">
            <v-alert type="error" variant="tonal" density="compact">
              {{ error }}
            </v-alert>
          </v-col>
        </v-row>
        
        <template v-else-if="individual">
          <v-row>
            <v-col cols="12" class="d-flex justify-center mb-3">
              <v-avatar color="primary" size="80">
                <v-img
                  v-if="individual.profilePicture"
                  :src="individual.profilePicture"
                  :alt="`${individual.firstName} ${individual.lastName}`"
                  cover
                ></v-img>
                <span v-else class="text-h4 text-white">
                  {{ getInitials(individual.firstName, individual.lastName) }}
                </span>
              </v-avatar>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" class="text-center mb-4">
              <div class="text-h5">{{ individual.firstName }} {{ individual.lastName }}</div>
            </v-col>
          </v-row>
          
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-identifier" color="primary"></v-icon>
              </template>
              <v-list-item-title>CDCR Number</v-list-item-title>
              <v-list-item-subtitle>{{ individual.cdcrNumber }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-office-building" color="primary"></v-icon>
              </template>
              <v-list-item-title>Facility</v-list-item-title>
              <v-list-item-subtitle>{{ facilityName }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-home" color="primary"></v-icon>
              </template>
              <v-list-item-title>Housing Unit</v-list-item-title>
              <v-list-item-subtitle>{{ individual.housingUnit }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item v-if="individual.disabilities && individual.disabilities.length > 0">
              <template v-slot:prepend>
                <v-icon icon="mdi-account-alert" color="primary"></v-icon>
              </template>
              <v-list-item-title>Disabilities</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip-group>
                  <v-chip
                    v-for="disability in individual.disabilities"
                    :key="disability.id"
                    size="small"
                    color="primary"
                    variant="outlined"
                  >
                    {{ disability.disability.type }}
                  </v-chip>
                </v-chip-group>
              </v-list-item-subtitle>
            </v-list-item>
            
            <!-- Communication Preferences Section -->
            <v-list-item v-if="!loadingNotes">
              <template v-slot:prepend>
                <v-icon icon="mdi-message-text" color="primary"></v-icon>
              </template>
              <v-list-item-title class="d-flex align-center">
                Communication Preferences
                <v-btn
                  v-if="individualNotes.length > 0"
                  icon="mdi-pencil"
                  size="x-small"
                  variant="text"
                  color="primary"
                  class="ml-1"
                  @click="viewAllNotes"
                  title="View all notes"
                ></v-btn>
              </v-list-item-title>
              <v-list-item-subtitle v-if="loadingNotes" class="mt-2">
                <v-progress-linear indeterminate></v-progress-linear>
              </v-list-item-subtitle>
              <v-list-item-subtitle v-else-if="individualNotes.length === 0" class="fst-italic text-grey">
                No communication notes yet
              </v-list-item-subtitle>
              <v-list-item-subtitle v-else>
                <v-expansion-panels variant="accordion" class="mt-2">
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-body-2 py-1">
                      <v-chip size="x-small" color="primary" class="mr-2">
                        {{ individualNotes.length }} {{ individualNotes.length === 1 ? 'note' : 'notes' }}
                      </v-chip>
                      {{ getLatestNote.title }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <p class="text-body-2 mb-2">{{ getLatestNote.content }}</p>
                      <div class="d-flex align-center text-caption text-grey">
                        <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                        {{ formatDate(getLatestNote.createdAt) }}
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>
      
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRosterStore } from '@/store/roster';
import { useCommunicationNotesStore } from '@/stores/communicationNotes';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import type { Individual } from '@/types';
import type { CommunicationNote } from '@/services/communication-notes.service';

const props = defineProps<{
  modelValue: boolean;
  individualId: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const rosterStore = useRosterStore();
const communicationNotesStore = useCommunicationNotesStore();
const router = useRouter();
const individual = ref<Individual | null>(null);
const loading = ref(false);
const loadingNotes = ref(false);
const error = ref<string | null>(null);

// Simplified facility mapping - in a real app, you would fetch this from an API
const facilityMap: Record<string, string> = {
  '1': 'Main Facility',
  '2': 'East Wing',
  '3': 'West Wing',
  '4': 'North Facility',
  '5': 'South Facility'
};

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const facilityName = computed(() => {
  if (!individual.value || !individual.value.facilityId) return 'Unknown';
  return facilityMap[individual.value.facilityId] || `Facility ${individual.value.facilityId}`;
});

const individualNotes = computed(() => {
  if (!individual.value) return [];
  return communicationNotesStore.getNotesForIndividual(Number(individual.value.id));
});

const getLatestNote = computed(() => {
  if (individualNotes.value.length === 0) return null;
  return individualNotes.value[0]; // Assuming notes are sorted by date desc
});

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateStr;
  }
};

const fetchIndividualDetails = async () => {
  if (!props.individualId) return;
  
  try {
    loading.value = true;
    error.value = null;
    individual.value = await rosterStore.fetchIndividualById(props.individualId);
    await fetchCommunicationNotes();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load individual details';
    console.error('Error fetching individual details:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCommunicationNotes = async () => {
  if (!individual.value) return;
  
  try {
    loadingNotes.value = true;
    await communicationNotesStore.fetchNotes({ individualId: Number(individual.value.id) });
  } catch (err) {
    console.error('Error fetching communication notes:', err);
  } finally {
    loadingNotes.value = false;
  }
};

const viewAllNotes = () => {
  if (!individual.value) return;
  close();
  router.push(`/roster/${individual.value.id}`);
  // Delay to ensure page loads before switching tabs
  setTimeout(() => {
    // This requires that the IndividualDetails component has an exported activeTab ref
    // If not available, this will silently fail but navigation will still work
    const individualDetailsComponent = document.querySelector('.individual-details');
    if (individualDetailsComponent && individualDetailsComponent.__vue__) {
      individualDetailsComponent.__vue__.activeTab = 'notes';
    }
  }, 300);
};

const close = () => {
  showDialog.value = false;
  // Reset data on close to prevent flashing old data when reopening
  setTimeout(() => {
    if (!showDialog.value) {
      individual.value = null;
      error.value = null;
    }
  }, 300); // Small delay to wait for dialog close animation
};

onMounted(async () => {
  // Fetch categories on component mount
  await communicationNotesStore.fetchCategories();
});

watch(() => props.individualId, (newVal) => {
  if (newVal && showDialog.value) {
    fetchIndividualDetails();
  }
});

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.individualId) {
    fetchIndividualDetails();
  }
});
</script> 