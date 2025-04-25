import api from './api.config'
import { Individual } from '../types'

export class RosterService {
  static async getIndividuals() {
    const response = await api.get('/individuals')
    return response.data
  }

  static async getIndividualById(id: string | number) {
    const response = await api.get(`/individuals/${id}`)
    return response.data
  }

  static async searchIndividuals(query: string) {
    const response = await api.get('/individuals/search', {
      params: { query }
    })
    return response.data
  }

  static async getIndividualsByUnit(unit: string) {
    const response = await api.get(`/individuals/unit/${unit}`)
    return response.data
  }
} 