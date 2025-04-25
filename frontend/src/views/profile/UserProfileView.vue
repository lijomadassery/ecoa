<template>
  <div class="profile-view">
    <v-container>
      <v-row class="mb-8">
        <v-col cols="12">
          <h1 class="text-h4 font-weight-medium mb-2">User Profile</h1>
          <div class="text-subtitle-1 text-medium-emphasis">View and manage your profile information</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <!-- User Avatar Card -->
          <v-card class="mb-4" rounded="lg">
            <v-card-text class="text-center pa-6">
              <v-avatar size="120" color="primary" class="mb-4">
                <v-img
                  v-if="userProfilePicture"
                  :src="userProfilePicture"
                  cover
                  :alt="userFullName"
                ></v-img>
                <span v-else class="text-h4 white--text">
                  {{ userInitials }}
                </span>
              </v-avatar>
              <h2 class="text-h5 font-weight-medium mb-1">{{ userFullName }}</h2>
              <div class="text-subtitle-1 text-medium-emphasis">{{ authStore.userRole || 'User' }}</div>
              
              <v-btn
                color="primary"
                prepend-icon="mdi-pencil"
                class="mt-6"
                variant="outlined"
                @click="uploadProfilePicture"
              >
                Change Photo
              </v-btn>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="onFileSelected"
              />
            </v-card-text>
          </v-card>

          <!-- Account Information -->
          <v-card rounded="lg">
            <v-card-title class="px-4 pt-4 pb-2">
              Account Information
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary" class="mr-2">mdi-badge-account</v-icon>
                  </template>
                  <v-list-item-title>Badge Number</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.user?.badgeNumber || 'Not set' }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary" class="mr-2">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.user?.email || 'Not set' }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary" class="mr-2">mdi-shield-account</v-icon>
                  </template>
                  <v-list-item-title>Role</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.userRole }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <!-- Security Settings -->
          <v-card class="mb-4" rounded="lg">
            <v-card-title class="px-4 pt-4 pb-2">
              Security Settings
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="changePassword">
                <v-text-field
                  v-model="currentPassword"
                  label="Current Password"
                  type="password"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>
                
                <v-text-field
                  v-model="newPassword"
                  label="New Password"
                  type="password"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>
                
                <v-text-field
                  v-model="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  class="mb-2"
                ></v-text-field>

                <v-btn
                  color="primary"
                  type="submit"
                  class="mt-4"
                  :loading="loading"
                  :disabled="!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword"
                >
                  Change Password
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Preferences -->
          <v-card rounded="lg">
            <v-card-title class="px-4 pt-4 pb-2">
              Preferences
            </v-card-title>
            <v-card-text>
              <v-switch
                v-model="notificationsEnabled"
                label="Enable Push Notifications"
                color="primary"
                hide-details
                class="mb-2"
              ></v-switch>
              
              <v-switch
                v-model="soundEnabled"
                label="Enable Sound Alerts"
                color="primary"
                hide-details
                class="mb-2"
              ></v-switch>
              
              <v-select
                v-model="theme"
                label="Theme"
                :items="themes"
                variant="outlined"
                class="mt-4"
              ></v-select>
              
              <v-btn
                color="primary"
                class="mt-4"
                :loading="savingPreferences"
                :disabled="!preferencesChanged"
                @click="savePreferences"
              >
                Save Preferences
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();

// Form state
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);

// Preferences
const notificationsEnabled = ref(true);
const soundEnabled = ref(true);
const theme = ref('light');
const themes = ['light', 'dark', 'system'];
const savingPreferences = ref(false);
const initialPreferences = {
  notifications: true,
  sound: true,
  theme: 'light'
};

// Add to script section
const fileInput = ref<HTMLInputElement | null>(null);

// Computed
const userFullName = computed(() => {
  const user = authStore.user;
  return user ? `${user.firstName} ${user.lastName}` : '';
});

const userInitials = computed(() => {
  const user = authStore.user;
  return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';
});

const preferencesChanged = computed(() => {
  return notificationsEnabled.value !== initialPreferences.notifications ||
    soundEnabled.value !== initialPreferences.sound ||
    theme.value !== initialPreferences.theme;
});

// Updated computed property for profile picture
const userProfilePicture = computed(() => {
  const user = authStore.user;
  return user?.profilePicture || null;
});

// Methods
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.error('New passwords do not match');
    return;
  }
  
  try {
    loading.value = true;
    // TODO: Implement password change API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
    toast.success('Password changed successfully');
    
    // Reset form
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    toast.error('Failed to change password');
    console.error('Error changing password:', error);
  } finally {
    loading.value = false;
  }
};

const savePreferences = async () => {
  try {
    savingPreferences.value = true;
    // TODO: Implement save preferences API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
    
    // Update initial values
    initialPreferences.notifications = notificationsEnabled.value;
    initialPreferences.sound = soundEnabled.value;
    initialPreferences.theme = theme.value;
    
    toast.success('Preferences saved successfully');
  } catch (error) {
    toast.error('Failed to save preferences');
    console.error('Error saving preferences:', error);
  } finally {
    savingPreferences.value = false;
  }
};

// Methods for handling profile picture upload
const uploadProfilePicture = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should not exceed 2MB');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string;
        
        // Update the profile picture
        await authStore.updateProfilePicture(imageData);
        toast.success('Profile picture updated successfully');
      } catch (error) {
        toast.error('Failed to update profile picture');
        console.error('Error updating profile picture:', error);
      } finally {
        // Reset the input value so the same file can be selected again
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      }
    };
    
    reader.readAsDataURL(file);
  }
};
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: rgb(250, 250, 250);
  padding: 16px 0;
}
</style> 