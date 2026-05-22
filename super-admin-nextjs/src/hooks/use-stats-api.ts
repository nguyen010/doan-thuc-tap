"use client"

import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '@/services/statistics.service'
import { MOCK_STATS } from '@/lib/mock-data'

export function useOverviewStats() {
  return useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: async () => {
      try {
        const data = await statisticsService.getOverview()
        return {
          totalUsers: data.totalUsers ?? data.users ?? MOCK_STATS.totalUsers,
          totalEvents: data.totalEvents ?? data.events ?? MOCK_STATS.totalEvents,
          activeEvents: data.activeEvents ?? 0,
          checkInRate: data.checkInRate ?? data.attendanceRate ?? MOCK_STATS.checkInRate,
          totalRegistrations: data.totalRegistrations ?? MOCK_STATS.totalRegistrations,
        }
      } catch {
        return MOCK_STATS
      }
    },
  })
}

export function useTopStudents() {
  return useQuery({
    queryKey: ['statistics', 'top-students'],
    queryFn: async () => {
      try {
        const data = await statisticsService.getTopStudents()
        return Array.isArray(data) ? data : (data?.data ?? [])
      } catch {
        return []
      }
    },
  })
}
