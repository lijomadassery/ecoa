import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RosterService } from '@/services/roster'
import type { Individual } from '@/types'

export const useRosterStore = defineStore('roster', () => {
  // State
  const individuals = ref<Individual[]>([])
  const selectedIndividual = ref<Individual | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getIndividualById = computed(() => {
    return (id: string) => individuals.value.find(i => i.id === id)
  })

  const getIndividualsByUnit = computed(() => {
    return (unit: string) => individuals.value.filter(i => 
      i.housingUnit.toLowerCase().includes(unit.toLowerCase())
    )
  })

  // Actions
  async function fetchIndividuals() {
    try {
      loading.value = true
      error.value = null
      const response = await RosterService.getIndividuals()
      individuals.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch individuals'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function fetchIndividualById(id: string) {
    try {
      loading.value = true
      error.value = null
      const response = await RosterService.getIndividualById(id)
      selectedIndividual.value = response
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch individual'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function searchIndividuals(query: string) {
    try {
      loading.value = true
      error.value = null
      const response = await RosterService.searchIndividuals(query)
      individuals.value = response
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    individuals,
    selectedIndividual,
    loading,
    error,

    // Getters
    getIndividualById,
    getIndividualsByUnit,

    // Actions
    fetchIndividuals,
    fetchIndividualById,
    searchIndividuals
  }
}) 