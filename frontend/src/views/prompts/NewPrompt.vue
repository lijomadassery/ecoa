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
            <v-card class="mb-4" rounded="lg">
              <v-card-title class="text-subtitle-1 px-4 pt-4">
                Capture Signature
              </v-card-title>
              
              <v-card-text>
                <div class="signature-container" ref="signaturePad">
                  <canvas 
                    ref="canvas" 
                    class="signature-canvas"
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRosterStore } from '@/store/roster'
import { useAuthStore } from '@/store/auth'
import { usePromptStore } from '@/store/prompts'
import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()
const rosterStore = useRosterStore()
const authStore = useAuthStore()
const promptStore = usePromptStore()

// State
const loading = ref(true)
const saving = ref(false)
const signaturePad = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const promptTime = ref(format(new Date(), 'HH:mm'))
const promptMeal = ref('Breakfast')

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

// Canvas handling
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hasSignature = false;

// Methods
function initCanvas() {
  console.log('Initializing canvas - DOM elements:', { 
    canvas: canvas.value !== null, 
    container: signaturePad.value !== null 
  });
  
  if (!canvas.value) {
    console.error('Canvas element not found in initCanvas');
    return;
  }

  // Set canvas size
  const container = signaturePad.value;
  if (container) {
    const width = container.clientWidth - 16; // Adjusted for padding
    const height = 200;
    canvas.value.width = width;
    canvas.value.height = height;
    console.log(`Canvas size set to ${width}x${height}`);
  }

  // Get context
  ctx.value = canvas.value.getContext('2d');
  if (ctx.value) {
    // Canvas setup
    ctx.value.strokeStyle = '#000';
    ctx.value.lineWidth = 2.5;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    
    // Clear the canvas
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    
    // Draw a light gray border to indicate the signing area
    ctx.value.save();
    ctx.value.strokeStyle = '#e0e0e0';
    ctx.value.lineWidth = 1;
    ctx.value.rect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.stroke();
    ctx.value.restore();
    
    console.log('Canvas context initialized');
    
    // Setup event listeners
    canvas.value.addEventListener('pointerdown', startDrawing);
    canvas.value.addEventListener('pointermove', draw);
    canvas.value.addEventListener('pointerup', stopDrawing);
    canvas.value.addEventListener('pointerleave', stopDrawing);
  } else {
    console.error('Failed to get canvas context');
  }
}

function startDrawing(e: PointerEvent) {
  e.preventDefault();
  isDrawing = true;
  const pos = getEventPosition(e);
  lastX = pos.x;
  lastY = pos.y;
}

function draw(e: PointerEvent) {
  if (!isDrawing || !ctx.value || !canvas.value) return;
  e.preventDefault();
  
  const pos = getEventPosition(e);
  
  ctx.value.beginPath();
  ctx.value.moveTo(lastX, lastY);
  ctx.value.lineTo(pos.x, pos.y);
  ctx.value.stroke();
  
  lastX = pos.x;
  lastY = pos.y;
  
  // Mark that we have a signature
  hasSignature = true;
}

function stopDrawing() {
  isDrawing = false;
}

function getEventPosition(e: PointerEvent) {
  if (!canvas.value) return { x: 0, y: 0 };
  
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function cleanupCanvas() {
  if (canvas.value) {
    canvas.value.removeEventListener('pointerdown', startDrawing);
    canvas.value.removeEventListener('pointermove', draw);
    canvas.value.removeEventListener('pointerup', stopDrawing);
    canvas.value.removeEventListener('pointerleave', stopDrawing);
  }
}

function clearSignature() {
  if (!canvas.value || !ctx.value) return;
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  
  // Draw the border again
  ctx.value.save();
  ctx.value.strokeStyle = '#e0e0e0';
  ctx.value.lineWidth = 1;
  ctx.value.rect(0, 0, canvas.value.width, canvas.value.height);
  ctx.value.stroke();
  ctx.value.restore();
  
  // Reset signature status
  hasSignature = false;
}

const saveSignature = async () => {
  if (!canvas.value || !ctx.value || !individual.value || !promptTypeId.value) {
    console.error('Missing required data for saving signature');
    return;
  }
  
  try {
    saving.value = true;
    
    // Get signature data from canvas
    const signatureData = canvas.value.toDataURL('image/png');
    console.log('Captured signature data', { length: signatureData.length });
    
    await promptStore.createPrompt({
      individualId: parseInt(individual.value.id),
      promptTypeId: promptTypeId.value,
      status: 'COMPLETED',
      notes: formattedPromptContent.value + '\n\nSignature captured electronically.',
      location: individual.value.housingUnit,
      deviceId: 'web'
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
    await promptStore.createPrompt({
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
    await promptStore.createPrompt({
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

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true;
    
    // Fetch individual
    const individualId = route.params.id;
    if (individualId) {
      await rosterStore.fetchIndividualById(individualId as string);
    }
    
    // Wait for DOM to be fully rendered and then initialize canvas
    await nextTick();
    // Add additional delay to ensure DOM is ready
    setTimeout(() => {
      initCanvas();
      loading.value = false;
    }, 300);
    
  } catch (error) {
    console.error('Error initializing prompt view:', error);
    loading.value = false;
  }
});

// Variable to store resize timer
let resizeTimer: number;

onUnmounted(() => {
  cleanupCanvas();
  window.removeEventListener('resize', initCanvas);
  // Clear any pending resize timer
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  // Debounce resize event
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    initCanvas();
  }, 250) as unknown as number;
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
}
</style> 