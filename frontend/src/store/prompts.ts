import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PromptsService, type PromptType, type Prompt } from '@/services/prompts.service'

export const usePromptStore = defineStore('prompts', () => {
  // State
  const promptTypes = ref<PromptType[]>([])
  const prompts = ref<Prompt[]>([])
  const loading = ref(false)

  // Getters
  const getPromptTypeById = computed(() => (id: number) => {
    return promptTypes.value.find(type => type.id === id)
  })

  const getPromptsByIndividual = computed(() => (individualId: number) => {
    return prompts.value.filter(prompt => prompt.individualId === individualId)
  })

  // Actions
  const fetchPromptTypes = async () => {
    try {
      loading.value = true
      const types = await PromptsService.getPromptTypes()
      promptTypes.value = types
    } catch (error) {
      console.error('Failed to fetch prompt types:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchPrompts = async () => {
    try {
      loading.value = true
      const data = await PromptsService.getPrompts()
      prompts.value = data
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createPrompt = async (data: {
    individualId: number
    promptTypeId: number
    status: string
    notes?: string
    location: string
    deviceId: string
  }) => {
    try {
      const newPrompt = await PromptsService.createPrompt(data)
      prompts.value.unshift(newPrompt)
      return newPrompt
    } catch (error) {
      console.error('Failed to create prompt:', error)
      throw error
    }
  }

  const updatePromptStatus = async (id: number, status: string, notes?: string) => {
    try {
      const updatedPrompt = await PromptsService.updatePromptStatus(id, status, notes)
      const index = prompts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        prompts.value[index] = updatedPrompt
      }
    } catch (error) {
      console.error('Failed to update prompt status:', error)
      throw error
    }
  }

  return {
    // State
    promptTypes,
    prompts,
    loading,
    
    // Getters
    getPromptTypeById,
    getPromptsByIndividual,
    
    // Actions
    fetchPromptTypes,
    fetchPrompts,
    createPrompt,
    updatePromptStatus
  }
}) 