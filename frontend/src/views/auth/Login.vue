<template>
  <div class="login-page">
    <div class="portal-background">
      <!-- Floating app icons background elements -->
      <div class="floating-icon icon-1">
        <v-icon size="40" color="primary" opacity="0.1">mdi-clipboard-text-outline</v-icon>
      </div>
      <div class="floating-icon icon-2">
        <v-icon size="32" color="primary" opacity="0.1">mdi-file-document-outline</v-icon>
      </div>
      <div class="floating-icon icon-3">
        <v-icon size="48" color="primary" opacity="0.1">mdi-account-group</v-icon>
      </div>
      <div class="floating-icon icon-4">
        <v-icon size="36" color="primary" opacity="0.1">mdi-magnify</v-icon>
      </div>
      <div class="floating-icon icon-5">
        <v-icon size="42" color="primary" opacity="0.1">mdi-briefcase-outline</v-icon>
      </div>
    </div>

    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="8" lg="6" xl="5">
          <div class="text-center mb-6">
            <h1 class="text-h3 font-weight-bold primary--text">Application Portal</h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-2">
              One portal. Multiple solutions.
            </p>
          </div>

          <v-card class="login-card">
            <v-card-text class="pa-6">
              <!-- Portal Logo -->
              <div class="text-center mb-8">
                <v-avatar size="90" color="primary" class="elevation-4">
                  <span class="text-h4 font-weight-bold white--text">DAI</span>
                </v-avatar>
              </div>

              <!-- Login Form -->
              <h2 class="text-h5 font-weight-bold mb-6 text-center">Sign In to Access</h2>
              
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
                  class="login-btn mb-4"
                >
                  Access Portal
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Footer -->
          <div class="text-center mt-4">
            <p class="text-caption text-medium-emphasis">
              <v-icon size="small" class="mr-1">mdi-shield-check</v-icon>
              Secure Connection
            </p>
            <p class="text-caption text-medium-emphasis mt-1">
              Version 1.0 &copy; 2023 Department of Adult Institutions
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
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
    
    router.push('/apps')
  } catch (err) {
    console.error('Login error:', err);
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%);
  overflow: hidden;
}

.portal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.floating-icon {
  position: absolute;
  z-index: 1;
  opacity: 0.6;
}

.icon-1 {
  top: 15%;
  left: 10%;
  animation: float 8s ease-in-out infinite;
}

.icon-2 {
  top: 25%;
  right: 15%;
  animation: float 10s ease-in-out infinite 1s;
}

.icon-3 {
  bottom: 20%;
  left: 20%;
  animation: float 9s ease-in-out infinite 2s;
}

.icon-4 {
  top: 40%;
  right: 25%;
  animation: float 7s ease-in-out infinite 0.5s;
}

.icon-5 {
  bottom: 30%;
  right: 10%;
  animation: float 11s ease-in-out infinite 1.5s;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

.login-card {
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.login-btn {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(var(--v-theme-primary), 0.2);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .login-card {
    border-radius: 12px;
  }
  
  .floating-icon {
    opacity: 0.3;
  }
}
</style> 