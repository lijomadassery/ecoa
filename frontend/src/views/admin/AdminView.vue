<template>
  <div class="admin-view">
    <v-container>
      <v-row class="mb-8">
        <v-col cols="12">
          <h1 class="text-h4 font-weight-medium mb-2">User Management</h1>
          <div class="text-subtitle-1 text-medium-emphasis">
            Create, edit, and manage system users
          </div>
        </v-col>
      </v-row>

      <!-- Action Buttons -->
      <v-row class="mb-6">
        <v-col>
          <v-btn
            color="primary"
            prepend-icon="mdi-account-plus"
            @click="openUserDialog()"
          >
            Add User
          </v-btn>
        </v-col>

        <v-spacer></v-spacer>

        <v-col cols="12" sm="4" md="3">
          <v-text-field
            v-model="search"
            label="Search Users"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            @update:model-value="handleSearch"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Users Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          :search="search"
          class="elevation-1 rounded-lg"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.status === 'active' ? 'success' : 'error'"
              size="small"
              class="text-uppercase"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.profilePicture="{ item }">
            <v-avatar size="40">
              <v-img
                v-if="item.profilePicture"
                :src="item.profilePicture"
                cover
                :alt="item.firstName + ' ' + item.lastName"
              ></v-img>
              <span v-else class="text-caption">
                {{ getInitials(item.firstName, item.lastName) }}
              </span>
            </v-avatar>
          </template>

          <template v-slot:item.name="{ item }">
            {{ item.firstName }} {{ item.lastName }}
          </template>

          <template v-slot:item.role="{ item }">
            <v-chip
              :color="getRoleColor(item.role)"
              size="small"
              label
            >
              {{ item.role }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip text="Edit User">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  v-bind="props"
                  @click="openUserDialog(item)"
                >
                  <v-icon size="small">mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Reset Password">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  v-bind="props"
                  @click="showResetPasswordDialog(item)"
                >
                  <v-icon size="small">mdi-lock-reset</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip :text="item.status === 'active' ? 'Deactivate User' : 'Activate User'">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  v-bind="props"
                  @click="toggleUserStatus(item)"
                >
                  <v-icon size="small" :color="item.status === 'active' ? 'error' : 'success'">
                    {{ item.status === 'active' ? 'mdi-close-circle' : 'mdi-check-circle' }}
                  </v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- User Dialog -->
    <v-dialog v-model="userDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ editedItem.id ? 'Edit User' : 'Create New User' }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="form" v-model="isFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.firstName"
                  label="First Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.lastName"
                  label="Last Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.username"
                  label="Username"
                  :rules="[rules.required]"
                  variant="outlined"
                  :disabled="!!editedItem.id"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.badgeNumber"
                  label="Badge Number"
                  :rules="[rules.required]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.role"
                  label="Role"
                  :items="roles"
                  :rules="[rules.required]"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-row v-if="!editedItem.id">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.password"
                  label="Password"
                  type="password"
                  :rules="[rules.required, rules.minLength]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.confirmPassword"
                  label="Confirm Password"
                  type="password"
                  :rules="[rules.required, rules.passwordMatch]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="userDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!isFormValid"
            @click="saveUser"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reset Password Dialog -->
    <v-dialog v-model="resetPasswordDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Reset Password
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="mb-4">Set a new password for {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</p>
          <v-form ref="resetPasswordForm" v-model="isResetFormValid">
            <v-text-field
              v-model="newPassword"
              label="New Password"
              type="password"
              :rules="[rules.required, rules.minLength]"
              variant="outlined"
              required
            ></v-text-field>
            <v-text-field
              v-model="confirmNewPassword"
              label="Confirm New Password"
              type="password"
              :rules="[rules.required, rules.resetPasswordMatch]"
              variant="outlined"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="resetPasswordDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="resettingPassword"
            :disabled="!isResetFormValid"
            @click="resetPassword"
          >
            Reset Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ confirmTitle }}
        </v-card-title>
        <v-card-text class="pt-2">
          {{ confirmMessage }}
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="confirmDialog = false">Cancel</v-btn>
          <v-btn 
            :color="confirmColor" 
            @click="confirmAction"
            :loading="confirmLoading"
          >
            {{ confirmButton }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { AdminService } from '@/services/admin.service';
import type { User } from '@/types';

const toast = useToast();

// Table state
const users = ref<User[]>([]);
const loading = ref(false);
const search = ref('');

// Form state
const form = ref();
const userDialog = ref(false);
const isFormValid = ref(false);
const saving = ref(false);

// Reset password state
const resetPasswordDialog = ref(false);
const resetPasswordForm = ref();
const isResetFormValid = ref(false);
const newPassword = ref('');
const confirmNewPassword = ref('');
const selectedUser = ref<User | null>(null);
const resettingPassword = ref(false);

// Confirmation dialog state
const confirmDialog = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmButton = ref('');
const confirmColor = ref('');
const confirmCallback = ref<() => Promise<void>>(() => Promise.resolve());
const confirmLoading = ref(false);

// Default user object
const defaultItem = {
  id: 0,
  username: '',
  firstName: '',
  lastName: '',
  badgeNumber: '',
  role: 'OFFICER',
  password: '',
  confirmPassword: '',
  profilePicture: '',
  status: 'active'
};

// Editable user
const editedItem = reactive({ ...defaultItem });

// Table headers
const headers = [
  { title: 'Photo', key: 'profilePicture', sortable: false, align: 'center' },
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Username', key: 'username', align: 'start' },
  { title: 'Badge #', key: 'badgeNumber', align: 'start' },
  { title: 'Role', key: 'role', align: 'center' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
];

// Available roles
const roles = ['ADMIN', 'OFFICER', 'SUPERVISOR'];

// Form validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  passwordMatch: (v: string) => v === editedItem.password || 'Passwords do not match',
  resetPasswordMatch: (v: string) => v === newPassword.value || 'Passwords do not match'
};

// Fetch users on component mount
onMounted(async () => {
  await fetchUsers();
});

// Methods
const fetchUsers = async () => {
  loading.value = true;
  try {
    users.value = await AdminService.getUsers();
  } catch (error) {
    toast.error('Failed to load users');
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

const openUserDialog = (item?: User) => {
  if (item) {
    // Edit existing user
    Object.assign(editedItem, item);
  } else {
    // Create new user
    Object.assign(editedItem, defaultItem);
  }
  userDialog.value = true;
};

const saveUser = async () => {
  if (!isFormValid.value) return;
  
  saving.value = true;
  try {
    if (editedItem.id) {
      // Update existing user
      await AdminService.updateUser(editedItem.id, {
        firstName: editedItem.firstName,
        lastName: editedItem.lastName,
        badgeNumber: editedItem.badgeNumber,
        role: editedItem.role
      });
      toast.success('User updated successfully');
    } else {
      // Create new user
      await AdminService.createUser({
        username: editedItem.username,
        firstName: editedItem.firstName,
        lastName: editedItem.lastName,
        badgeNumber: editedItem.badgeNumber,
        role: editedItem.role,
        password: editedItem.password
      });
      toast.success('User created successfully');
    }
    
    // Refresh user list and close dialog
    await fetchUsers();
    userDialog.value = false;
  } catch (error) {
    toast.error('Failed to save user');
    console.error('Error saving user:', error);
  } finally {
    saving.value = false;
  }
};

const showResetPasswordDialog = (user: User) => {
  selectedUser.value = user;
  newPassword.value = '';
  confirmNewPassword.value = '';
  isResetFormValid.value = false;
  resetPasswordDialog.value = true;
};

const resetPassword = async () => {
  if (!isResetFormValid.value || !selectedUser.value) return;
  
  resettingPassword.value = true;
  try {
    await AdminService.resetUserPassword(selectedUser.value.id, newPassword.value);
    toast.success('Password reset successfully');
    resetPasswordDialog.value = false;
  } catch (error) {
    toast.error('Failed to reset password');
    console.error('Error resetting password:', error);
  } finally {
    resettingPassword.value = false;
  }
};

const toggleUserStatus = (user: User) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  const action = newStatus === 'active' ? 'activate' : 'deactivate';
  
  confirmTitle.value = `${action.charAt(0).toUpperCase() + action.slice(1)} User`;
  confirmMessage.value = `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`;
  confirmButton.value = action.charAt(0).toUpperCase() + action.slice(1);
  confirmColor.value = newStatus === 'active' ? 'success' : 'error';
  
  confirmCallback.value = async () => {
    try {
      confirmLoading.value = true;
      await AdminService.updateUserStatus(user.id, newStatus);
      await fetchUsers();
      toast.success(`User ${action}d successfully`);
      confirmDialog.value = false;
    } catch (error) {
      toast.error(`Failed to ${action} user`);
      console.error(`Error ${action}ing user:`, error);
    } finally {
      confirmLoading.value = false;
    }
  };
  
  confirmDialog.value = true;
};

const confirmAction = () => {
  confirmCallback.value();
};

const handleSearch = () => {
  // This function can be extended for more advanced search functionality
};

const getInitials = (firstName: string, lastName: string) => {
  return firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
    : '';
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'error';
    case 'SUPERVISOR':
      return 'warning';
    case 'OFFICER':
      return 'info';
    default:
      return 'grey';
  }
};
</script>

<style scoped>
.admin-view {
  background-color: rgb(250, 250, 250);
  min-height: 100vh;
  padding: 16px 0;
}
</style> 