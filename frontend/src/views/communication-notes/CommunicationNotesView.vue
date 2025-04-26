<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="mb-6">
          <v-card-title class="headline d-flex align-center">
            Communication Notes
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              New Note
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row class="filters mb-3">
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedCategory"
                  :items="communicationNotesStore.categories"
                  label="Filter by Category"
                  clearable
                  @update:model-value="filterByCategory"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Filter by Status"
                  clearable
                  @update:model-value="filterByStatus"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="searchTerm"
                  label="Search notes"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  @update:model-value="search"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="2" class="d-flex align-center">
                <v-btn color="secondary" @click="clearFilters">
                  Clear Filters
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              v-if="!communicationNotesStore.isLoading && communicationNotesStore.filteredNotes.length > 0"
              :headers="headers"
              :items="communicationNotesStore.filteredNotes"
              :items-per-page="10"
              class="elevation-1"
              item-key="id"
              @click:row="viewNote"
            >
              <template v-slot:item.priority="{ item }">
                <v-chip
                  :color="getPriorityColor(item.priority)"
                  size="small"
                >
                  {{ getPriorityText(item.priority) }}
                </v-chip>
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click.stop="viewNote(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click.stop="openEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click.stop="confirmDeleteNote(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>

            <v-skeleton-loader
              v-else-if="communicationNotesStore.isLoading"
              type="table"
            ></v-skeleton-loader>

            <v-alert
              v-else
              type="info"
              text="No communication notes found. Create a new note to get started."
            ></v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
              <p><strong>Individual:</strong> {{ selectedNote.individualName }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p><strong>Created By:</strong> {{ selectedNote.createdByName }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <p><strong>Created:</strong> {{ formatDate(selectedNote.createdAt) }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p><strong>Updated:</strong> {{ formatDate(selectedNote.updatedAt) }}</p>
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
            @click="openEditDialog(selectedNote)"
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
            <v-row v-if="!isEditMode">
              <v-col cols="12">
                <v-autocomplete
                  v-model="editedNote.individualId"
                  :items="individuals"
                  item-title="name"
                  item-value="id"
                  label="Individual"
                  required
                  :rules="[v => !!v || 'Individual is required']"
                ></v-autocomplete>
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { format } from 'date-fns';
import { useCommunicationNotesStore } from '@/stores/communicationNotes';
import { CommunicationNote } from '@/services/communication-notes.service';

const communicationNotesStore = useCommunicationNotesStore();

// Table
const headers = [
  { title: 'Title', align: 'start', key: 'title' },
  { title: 'Category', align: 'start', key: 'category' },
  { title: 'Individual', align: 'start', key: 'individualName' },
  { title: 'Priority', align: 'center', key: 'priority' },
  { title: 'Status', align: 'center', key: 'status' },
  { title: 'Created', align: 'start', key: 'createdAt' },
  { title: 'Actions', align: 'center', key: 'actions', sortable: false },
];

// Filters
const selectedCategory = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);
const searchTerm = ref('');

// Mock individuals data - replace with actual API call
const individuals = ref([
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mark Johnson' },
]);

// Dialogs
const viewDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const selectedNote = ref<CommunicationNote | null>(null);
const isEditMode = ref(false);
const isFormValid = ref(false);
const form = ref(null);

// Options
const statusOptions = ['ACTIVE', 'ARCHIVED'];
const priorityOptions = [
  { title: 'Low', value: 0 },
  { title: 'Medium', value: 1 },
  { title: 'High', value: 2 },
];
const commonTags = [
  'written', 'visual', 'gestures', 'appointments', 
  'medical', 'housing', 'legal', 'programs', 'needs-attention'
];

// Edited note
const editedNote = ref({
  id: 0,
  title: '',
  content: '',
  category: '',
  individualId: null as number | null,
  priority: 0,
  status: 'ACTIVE',
  tags: [] as string[]
});

// On component mount
onMounted(async () => {
  await Promise.all([
    communicationNotesStore.fetchNotes(),
    communicationNotesStore.fetchCategories()
  ]);
});

// Filter methods
const filterByCategory = () => {
  communicationNotesStore.setFilter({ category: selectedCategory.value || undefined });
};

const filterByStatus = () => {
  communicationNotesStore.setFilter({ status: selectedStatus.value || undefined });
};

const search = () => {
  communicationNotesStore.setFilter({ searchTerm: searchTerm.value || undefined });
};

const clearFilters = () => {
  selectedCategory.value = null;
  selectedStatus.value = null;
  searchTerm.value = '';
  communicationNotesStore.clearFilters();
};

// Note operations
const viewNote = (note: CommunicationNote) => {
  selectedNote.value = note;
  viewDialog.value = true;
};

const openCreateDialog = () => {
  isEditMode.value = false;
  editedNote.value = {
    id: 0,
    title: '',
    content: '',
    category: '',
    individualId: null,
    priority: 0,
    status: 'ACTIVE',
    tags: []
  };
  editDialog.value = true;
};

const openEditDialog = (note: CommunicationNote) => {
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
};

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
      individualId: editedNote.value.individualId as number,
      priority: editedNote.value.priority,
      tags: editedNote.value.tags,
      attachments: []
    });
    if (created) {
      editDialog.value = false;
    }
  }
};

const confirmDeleteNote = (note: CommunicationNote) => {
  selectedNote.value = note;
  viewDialog.value = false;
  deleteDialog.value = true;
};

const deleteNote = async () => {
  if (selectedNote.value) {
    const success = await communicationNotesStore.deleteNote(selectedNote.value.id);
    if (success) {
      deleteDialog.value = false;
      selectedNote.value = null;
    }
  }
};

// Utilities
const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateStr;
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 0: return 'info';
    case 1: return 'warning';
    case 2: return 'error';
    default: return 'gray';
  }
};

const getPriorityText = (priority: number) => {
  switch (priority) {
    case 0: return 'Low';
    case 1: return 'Medium';
    case 2: return 'High';
    default: return 'Unknown';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'ARCHIVED': return 'grey';
    default: return 'grey';
  }
};
</script>

<style scoped>
.content-area {
  min-height: 100px;
  white-space: pre-line;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  background-color: #f5f5f5;
}
</style> 