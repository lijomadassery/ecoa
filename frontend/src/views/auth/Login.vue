<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-6">
            <!-- Logo -->
            <div class="mb-8">
              <v-avatar size="100" color="primary" class="mb-4">
                <span class="text-h4 font-weight-bold white--text">ECOA</span>
              </v-avatar>
              <h1 class="text-h5 font-weight-bold primary--text">ECOA Login</h1>
            </div>

            <v-form @submit.prevent="handleLogin" ref="form">
              <!-- Username Field -->
              <v-text-field
                v-model="username"
                :rules="[rules.required]"
                label="Username"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                class="mb-4"
              ></v-text-field>

              <!-- Password Field -->
              <v-text-field
                v-model="password"
                :rules="[rules.required]"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                required
                class="mb-6"
              ></v-text-field>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
              >
                {{ error }}
              </v-alert>

              <!-- Login Button -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-4"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Version -->
        <div class="text-center mt-4 text-caption text-medium-emphasis">
          Version 1.0
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = ref()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required'
}

// Handle login
const handleLogin = async () => {
  console.log('Login attempt started with:', { username: username.value, password: '***' });
  
  const isValid = await form.value?.validate()
  console.log('Form validation result:', isValid);
  
  if (!isValid?.valid) {
    console.log('Form validation failed');
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    console.log('Calling authStore.login...');
    const response = await authStore.login({
      username: username.value,
      password: password.value
    })
    console.log('Login response:', { ...response, token: '***' });
    
    router.push('/dashboard')
  } catch (err) {
    console.error('Login error:', err);
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style> 