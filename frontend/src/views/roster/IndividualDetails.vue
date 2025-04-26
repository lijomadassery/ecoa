<template>
  <div class="individual-details">
    <!-- App Bar -->
    <v-app-bar color="primary">
      <v-btn icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-app-bar-title>Individual Details</v-app-bar-title>
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

      <!-- Tabs -->
      <v-card rounded="lg" class="mb-4">
        <v-tabs v-model="activeTab" color="primary" grow>
          <v-tab value="prompts">Prompts</v-tab>
          <v-tab value="notes">Communication Notes</v-tab>
        </v-tabs>
      </v-card>

      <div v-if="loading" class="d-flex justify-center align-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="error" class="pa-4 text-center">
        <v-icon icon="mdi-alert-circle" color="error" size="48" class="mb-2"></v-icon>
        <div class="text-body-1 text-medium-emphasis mb-4">{{ error }}</div>
        <v-btn color="primary" @click="fetchData">
          Try Again
        </v-btn>
      </div>

      <v-window v-model="activeTab">
        <!-- Prompts Tab -->
        <v-window-item value="prompts">
          <v-card rounded="lg">
            <v-card-title class="text-subtitle-1 px-4 pt-4 pb-2">
              Select Prompt Category
            </v-card-title>

            <v-list v-if="!loading && !error" select-strategy="independent">
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
        </v-window-item>

        <!-- Communication Notes Tab -->
        <v-window-item value="notes">
          <v-card rounded="lg">
            <v-card-title class="text-subtitle-1 px-4 pt-4 pb-2 d-flex align-center">
              Communication Notes
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="openCreateNoteDialog"
              >
                Add Note
              </v-btn>
            </v-card-title>

            <v-card-text v-if="communicationNotesStore.isLoading">
              <v-skeleton-loader type="list-item-three-line" :loading="true" class="my-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-three-line" :loading="true" class="my-2"></v-skeleton-loader>
            </v-card-text>

            <div v-else-if="communicationNotesStore.error" class="pa-4 text-center">
              <v-icon icon="mdi-alert-circle" color="error" size="48" class="mb-2"></v-icon>
              <div class="text-body-1 text-medium-emphasis mb-4">Failed to load communication notes</div>
              <v-btn color="primary" @click="loadCommunicationNotes">
                Try Again
              </v-btn>
            </div>

            <v-expand-transition>
              <v-card-text v-if="!communicationNotesStore.isLoading && individualNotes.length === 0" class="text-center pa-6">
                <v-icon icon="mdi-note-text-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
                <div class="text-h6 mb-2">No Communication Notes</div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Add notes about this individual's communication preferences and needs.
                </div>
                <v-btn color="primary" @click="openCreateNoteDialog">
                  Add First Note
                </v-btn>
              </v-card-text>
            </v-expand-transition>

            <v-list v-if="!communicationNotesStore.isLoading && individualNotes.length > 0" select-strategy="independent">
              <v-list-item
                v-for="note in individualNotes"
                :key="note.id"
                @click="viewNote(note)"
                class="mb-1"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getCategoryColor(note.category)"
                    variant="tonal"
                    rounded
                    size="40"
                  >
                    <v-icon :icon="getCategoryIcon(note.category)" :color="getCategoryColor(note.category)"></v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="d-flex align-center">
                  {{ note.title }}
                  <v-chip
                    v-if="note.priority > 0"
                    :color="getPriorityColor(note.priority)"
                    size="x-small"
                    class="ml-2"
                  >
                    {{ getPriorityText(note.priority) }}
                  </v-chip>
                </v-list-item-title>
                
                <v-list-item-subtitle class="text-truncate">
                  {{ note.content }}
                </v-list-item-subtitle>
                
                <v-list-item-subtitle class="text-caption text-grey">
                  Added {{ formatDate(note.createdAt) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <!-- View Note Dialog -->
    <v-dialog v-model="viewDialog" max-width="700px">
      <v-card v-if="selectedNote">
        <v-card-title class="headline">
          {{ selectedNote.title }}
          <v-chip
            class="ml-2"
            :color="getStatusColor(selectedNote.status)"
            size="small"
          >
            {{ selectedNote.status }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <p><strong>Category:</strong> {{ selectedNote.category }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p><strong>Priority:</strong> {{ getPriorityText(selectedNote.priority) }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <p><strong>Created By:</strong> {{ selectedNote.createdByName }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p><strong>Created:</strong> {{ formatDate(selectedNote.createdAt) }}</p>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col cols="12">
              <div class="content-area">
                {{ selectedNote.content }}
              </div>
            </v-col>
          </v-row>
          <v-row v-if="selectedNote.tags && selectedNote.tags.length > 0">
            <v-col cols="12">
              <p><strong>Tags:</strong></p>
              <v-chip
                v-for="tag in selectedNote.tags"
                :key="tag"
                class="mr-2 mb-2"
                size="small"
              >
                {{ tag }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            variant="outlined" 
            @click="openEditNoteDialog(selectedNote)"
          >
            Edit
          </v-btn>
          <v-btn 
            color="error" 
            variant="outlined" 
            @click="confirmDeleteNote(selectedNote)"
          >
            Delete
          </v-btn>
          <v-btn 
            color="secondary" 
            variant="tonal" 
            @click="viewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create/Edit Note Dialog -->
    <v-dialog v-model="editDialog" max-width="700px">
      <v-card>
        <v-card-title class="headline">
          {{ isEditMode ? 'Edit Communication Note' : 'Create Communication Note' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="editedNote.title"
                  label="Title"
                  required
                  :rules="[v => !!v || 'Title is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="editedNote.priority"
                  :items="priorityOptions"
                  label="Priority"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedNote.category"
                  :items="communicationNotesStore.categories"
                  label="Category"
                  required
                  :rules="[v => !!v || 'Category is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" v-if="isEditMode">
                <v-select
                  v-model="editedNote.status"
                  :items="statusOptions"
                  label="Status"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="editedNote.content"
                  label="Content"
                  required
                  :rules="[v => !!v || 'Content is required']"
                  rows="5"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-combobox
                  v-model="editedNote.tags"
                  :items="commonTags"
                  label="Tags"
                  multiple
                  chips
                  closable-chips
                ></v-combobox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="editDialog = false">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            :loading="communicationNotesStore.isLoading" 
            :disabled="!isFormValid"
            @click="saveNote"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this communication note? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            :loading="communicationNotesStore.isLoading" 
            @click="deleteNote"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useCommunicationNotesStore } from '@/stores/communicationNotes'
import { format } from 'date-fns'
import type { Individual } from '@/types'
import type { PromptType } from '@/services/prompts.service'
import type { CommunicationNote } from '@/services/communication-notes.service'

const router = useRouter()
const route = useRoute()
const rosterStore = useRosterStore()
const promptStore = usePromptStore()
const communicationNotesStore = useCommunicationNotesStore()

// State
const individual = ref<Individual | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('prompts')

// Dialogs
const viewDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedNote = ref<CommunicationNote | null>(null)
const isEditMode = ref(false)
const isFormValid = ref(false)
const form = ref(null)

// Options
const statusOptions = ['ACTIVE', 'ARCHIVED']
const priorityOptions = [
  { title: 'Low', value: 0 },
  { title: 'Medium', value: 1 },
  { title: 'High', value: 2 },
]
const commonTags = [
  'written', 'visual', 'gestures', 'appointments', 
  'medical', 'housing', 'legal', 'programs', 'needs-attention'
]

// Edited note
const editedNote = ref({
  id: 0,
  title: '',
  content: '',
  category: '',
  individualId: 0,
  priority: 0,
  status: 'ACTIVE',
  tags: [] as string[]
})

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

const individualNotes = computed(() => {
  if (!individual.value) return []
  return communicationNotesStore.getNotesForIndividual(Number(individual.value.id))
})

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

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Communication': 'mdi-message-text',
    'Medical': 'mdi-medical-bag',
    'Housing': 'mdi-home',
    'Programs': 'mdi-school',
    'Legal': 'mdi-gavel',
    'Other': 'mdi-information',
  };
  return icons[category] || 'mdi-note-text';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Communication': 'blue',
    'Medical': 'red',
    'Housing': 'green',
    'Programs': 'purple',
    'Legal': 'amber',
    'Other': 'grey',
  };
  return colors[category] || 'primary';
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

const loadCommunicationNotes = async () => {
  if (individual.value) {
    await communicationNotesStore.fetchNotes({ individualId: Number(individual.value.id) })
  }
}

const fetchPromptTypes = async () => {
  try {
    error.value = null;
    await promptStore.fetchPromptTypes();
  } catch (err) {
    error.value = 'Failed to load prompt types. Please try again.';
    console.error('Error fetching prompt types:', err);
  }
};

const fetchData = async () => {
  const id = route.params.id
  if (!id) return

  try {
    loading.value = true;
    error.value = null;
    
    // Fetch individual data, prompt types, and communication notes in parallel
    await Promise.all([
      (async () => {
        const data = await rosterStore.fetchIndividualById(id as string)
        individual.value = data
      })(),
      fetchPromptTypes(),
      communicationNotesStore.fetchCategories()
    ]);

    // Load communication notes after we have the individual data
    if (individual.value) {
      await loadCommunicationNotes()
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false;
  }
}

// Note operations
const viewNote = (note: CommunicationNote) => {
  selectedNote.value = note;
  viewDialog.value = true;
}

const openCreateNoteDialog = () => {
  if (!individual.value) return
  
  isEditMode.value = false;
  editedNote.value = {
    id: 0,
    title: '',
    content: '',
    category: communicationNotesStore.categories.length > 0 ? communicationNotesStore.categories[0] : 'Communication',
    individualId: Number(individual.value.id),
    priority: 0,
    status: 'ACTIVE',
    tags: []
  };
  editDialog.value = true;
}

const openEditNoteDialog = (note: CommunicationNote) => {
  isEditMode.value = true;
  editedNote.value = {
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.category,
    individualId: note.individualId,
    priority: note.priority,
    status: note.status,
    tags: [...note.tags]
  };
  viewDialog.value = false;
  editDialog.value = true;
}

const saveNote = async () => {
  if (isEditMode.value) {
    const updated = await communicationNotesStore.updateNote(editedNote.value);
    if (updated) {
      editDialog.value = false;
    }
  } else {
    const created = await communicationNotesStore.createNote({
      title: editedNote.value.title,
      content: editedNote.value.content,
      category: editedNote.value.category,
      individualId: Number(editedNote.value.individualId),
      priority: editedNote.value.priority,
      tags: editedNote.value.tags,
      attachments: []
    });
    if (created) {
      editDialog.value = false;
    }
  }
}

const confirmDeleteNote = (note: CommunicationNote) => {
  selectedNote.value = note;
  viewDialog.value = false;
  deleteDialog.value = true;
}

const deleteNote = async () => {
  if (selectedNote.value) {
    const success = await communicationNotesStore.deleteNote(selectedNote.value.id);
    if (success) {
      deleteDialog.value = false;
      selectedNote.value = null;
    }
  }
}

// Formatting utilities
const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateStr;
  }
}

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 0: return 'info';
    case 1: return 'warning';
    case 2: return 'error';
    default: return 'gray';
  }
}

const getPriorityText = (priority: number) => {
  switch (priority) {
    case 0: return 'Low';
    case 1: return 'Medium';
    case 2: return 'High';
    default: return 'Unknown';
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'ARCHIVED': return 'grey';
    default: return 'grey';
  }
}

// Lifecycle
onMounted(fetchData)
</script>

<style scoped>
.individual-details {
  min-height: 100vh;
  padding-bottom: 56px; /* Height of bottom navigation */
  background-color: rgb(250, 250, 250);
}

.content-area {
  min-height: 100px;
  white-space: pre-line;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  background-color: #f5f5f5;
}
</style> 