<template>
  <v-layout class="fill-height">
    <!-- App Bar -->
    <v-app-bar color="primary">
      <v-btn icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-app-bar-title>Signature Capture</v-app-bar-title>
    </v-app-bar>

    <v-main class="fill-height">
      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center align-center fill-height">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <v-container v-else class="fill-height pa-4">
        <v-row>
          <v-col cols="12">
            <!-- Prompt Info Card -->
            <v-card class="mb-4" rounded="lg">
              <v-card-item>
                <v-card-title class="text-subtitle-1 pb-1">
                  {{ individual?.firstName }} {{ individual?.lastName }} - CDCR# {{ individual?.cdcrNumber }}
                </v-card-title>
                <v-card-subtitle>
                  <div>Prompt: {{ promptTitle }}</div>
                  <div>Time: {{ currentTime }}</div>
                  <div>Officer: {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</div>
                </v-card-subtitle>
              </v-card-item>
            </v-card>

            <!-- Prompt Content -->
            <v-card class="mb-4" rounded="lg">
              <v-card-title class="text-subtitle-1 px-4 pt-4">
                Prompt Details
              </v-card-title>
              
              <v-card-text>
                <v-text-field
                  v-model="promptTime"
                  label="Time"
                  type="time"
                  class="mb-2"
                ></v-text-field>
                
                <v-select
                  v-if="promptType?.category?.toLowerCase() === 'meals'"
                  v-model="promptMeal"
                  label="Meal"
                  :items="['Breakfast', 'Lunch', 'Dinner']"
                  class="mb-2"
                ></v-select>
                
                <v-textarea
                  v-model="formattedPromptContent"
                  label="Prompt Content"
                  readonly
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-card-text>
            </v-card>

            <!-- Signature Area -->
            <v-card class="mb-4" rounded="lg" id="signatureCard">
              <v-card-title class="text-subtitle-1 px-4 pt-4">
                Capture Signature
              </v-card-title>
              
              <v-card-text>
                <div class="signature-container">
                  <canvas 
                    id="signatureCanvas"
                    ref="canvasElement"
                    class="signature-canvas"
                    @mousedown="startDrawing"
                    @mousemove="draw"
                    @mouseup="stopDrawing"
                    @mouseleave="stopDrawing"
                  ></canvas>
                  <div class="d-flex align-center justify-space-between px-2 mt-2">
                    <span class="text-caption text-medium-emphasis">Sign above</span>
                    <v-btn
                      variant="text"
                      density="comfortable"
                      size="small"
                      color="primary"
                      @click="clearSignature"
                      class="text-none"
                    >
                      Clear
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Action Buttons -->
            <v-btn
              color="primary"
              block
              size="large"
              class="mb-3"
              :loading="saving"
              @click="saveSignature"
            >
              Save Signature
            </v-btn>

            <v-row>
              <v-col cols="6">
                <v-btn
                  block
                  variant="outlined"
                  :loading="saving"
                  @click="markAsRefused"
                >
                  Refused
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  block
                  variant="outlined"
                  :loading="saving"
                  @click="markAsAttempted"
                >
                  Attempted
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRosterStore } from '@/store/roster'
import { useAuthStore } from '@/store/auth'
import { usePromptStore } from '@/store/prompts'
import { PromptsService } from '@/services/prompts.service'
import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()
const rosterStore = useRosterStore()
const authStore = useAuthStore()
const promptStore = usePromptStore()

// State
const loading = ref(true)
const saving = ref(false)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const canvasContext = ref<CanvasRenderingContext2D | null>(null)
const promptTime = ref(format(new Date(), 'HH:mm'))
const promptMeal = ref('Breakfast')

// Drawing state
let isDrawing = false
let lastX = 0
let lastY = 0
let hasSignature = false

// Computed
const individual = computed(() => rosterStore.selectedIndividual)
const promptTypeId = computed(() => {
  const id = route.query.promptTypeId;
  return id ? parseInt(id as string) : null;
})
const promptType = computed(() => {
  return promptTypeId.value ? promptStore.getPromptTypeById(promptTypeId.value) : null;
})
const promptTitle = computed(() => promptType.value?.name || 'Custom Prompt')

const formattedPromptContent = computed(() => {
  if (!promptType.value) return '';
  
  // Create a basic template based on the prompt type and description
  let content = `This is a ${promptType.value.name} prompt.`;
  
  // Add time
  content += `\nTime: ${promptTime.value}`;
  
  // Add meal if it's a meal prompt
  if (promptType.value.category.toLowerCase() === 'meals') {
    content += `\nMeal: ${promptMeal.value}`;
  }
  
  // Add description
  content += `\n\n${promptType.value.description}`;
  
  return content;
})

const currentTime = computed(() => format(new Date(), 'h:mm a - MMMM d, yyyy'))

// Watch for canvas element to be available
watch(canvasElement, (newCanvas) => {
  if (newCanvas) {
    console.log('Canvas element is now available, initializing');
    initializeCanvas();
  }
});

// Canvas methods
function initializeCanvas() {
  if (!canvasElement.value) {
    console.error('Canvas element is still not available');
    return;
  }
  
  console.log('Initializing canvas element', canvasElement.value);
  
  // Set canvas size based on container width
  const container = document.querySelector('.signature-container');
  if (container) {
    const width = container.clientWidth - 16;
    canvasElement.value.width = width;
    canvasElement.value.height = 200;
    console.log(`Canvas size set to ${width}x200`);
  }
  
  // Get the canvas context
  canvasContext.value = canvasElement.value.getContext('2d');
  
  if (!canvasContext.value) {
    console.error('Failed to get canvas context');
    return;
  }
  
  // Configure context
  canvasContext.value.strokeStyle = '#000';
  canvasContext.value.lineWidth = 2.5;
  canvasContext.value.lineCap = 'round';
  canvasContext.value.lineJoin = 'round';
  
  // Clear the canvas initially
  clearSignature();
  
  console.log('Canvas initialized successfully');
}

function startDrawing(e: MouseEvent) {
  if (!canvasElement.value || !canvasContext.value) return;
  
  isDrawing = true;
  
  const rect = canvasElement.value.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  
  console.log('Started drawing at', { lastX, lastY });
}

function draw(e: MouseEvent) {
  if (!isDrawing || !canvasContext.value || !canvasElement.value) return;
  
  const rect = canvasElement.value.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  canvasContext.value.beginPath();
  canvasContext.value.moveTo(lastX, lastY);
  canvasContext.value.lineTo(currentX, currentY);
  canvasContext.value.stroke();
  
  lastX = currentX;
  lastY = currentY;
  hasSignature = true;
}

function stopDrawing() {
  isDrawing = false;
}

function clearSignature() {
  if (!canvasElement.value || !canvasContext.value) return;
  
  canvasContext.value.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height);
  
  // Draw a light border to indicate the signing area
  canvasContext.value.save();
  canvasContext.value.strokeStyle = '#e0e0e0';
  canvasContext.value.lineWidth = 1;
  canvasContext.value.rect(0, 0, canvasElement.value.width, canvasElement.value.height);
  canvasContext.value.stroke();
  canvasContext.value.restore();
  
  hasSignature = false;
}

// Form actions
const saveSignature = async () => {
  if (!canvasElement.value || !canvasContext.value || !individual.value || !promptTypeId.value) {
    console.error('Missing required data for saving signature');
    return;
  }
  
  try {
    saving.value = true;
    
    // Get signature data from canvas
    const signatureData = canvasElement.value.toDataURL('image/png');
    
    // Use the service directly to bypass the store's type limitations
    await PromptsService.createPrompt({
      individualId: parseInt(individual.value.id),
      promptTypeId: promptTypeId.value,
      status: 'COMPLETED',
      notes: formattedPromptContent.value + '\n\nSignature captured electronically.',
      location: individual.value.housingUnit,
      deviceId: 'web',
      signatureData: signatureData
    });
    
    router.push('/history');
  } catch (error) {
    console.error('Error saving signature:', error);
  } finally {
    saving.value = false;
  }
};

const markAsRefused = async () => {
  if (!individual.value || !promptTypeId.value) return;
  
  try {
    saving.value = true;
    await PromptsService.createPrompt({
      individualId: parseInt(individual.value.id),
      promptTypeId: promptTypeId.value,
      status: 'REFUSED',
      notes: formattedPromptContent.value,
      location: individual.value.housingUnit,
      deviceId: 'web'
    });
    
    router.push('/history');
  } catch (error) {
    console.error('Error marking as refused:', error);
  } finally {
    saving.value = false;
  }
};

const markAsAttempted = async () => {
  if (!individual.value || !promptTypeId.value) return;
  
  try {
    saving.value = true;
    await PromptsService.createPrompt({
      individualId: parseInt(individual.value.id),
      promptTypeId: promptTypeId.value,
      status: 'ATTEMPTED',
      notes: formattedPromptContent.value,
      location: individual.value.housingUnit,
      deviceId: 'web'
    });
    
    router.push('/history');
  } catch (error) {
    console.error('Error marking as attempted:', error);
  } finally {
    saving.value = false;
  }
};

// Handle window resize
function handleResize() {
  initializeCanvas();
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true;
    console.log('Component mounted');
    
    // Fetch individual data
    const individualId = route.params.id;
    if (individualId) {
      await rosterStore.fetchIndividualById(individualId as string);
    }
    
    // Wait for next tick to ensure DOM is rendered
    await nextTick();
    
    // Add window resize event listener
    window.addEventListener('resize', handleResize);
    
    // Set loading to false - the canvas will initialize via the watcher
    loading.value = false;
  } catch (error) {
    console.error('Error initializing prompt view:', error);
    loading.value = false;
  }
});

onUnmounted(() => {
  console.log('Component unmounting - cleaning up');
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.signature-container {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: white;
}

.signature-canvas {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  touch-action: none;
  cursor: crosshair;
  display: block;
  background-color: rgba(250, 250, 250, 0.8);
}
</style> 