import { apiClient } from '@/lib/api-client'

export const statisticsService = {
  getOverview: async () => {
    const { data } = await apiClient.get('/statistics/overview')
    return data
  },
  getEventStats: async (eventId: string) => {
    const { data } = await apiClient.get(`/statistics/events/${eventId}`)
    return data
  },
  getTopStudents: async () => {
    const { data } = await apiClient.get('/statistics/students/top')
    return data
  },
}
