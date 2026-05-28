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
          totalUsers: data.totalStudents ?? data.totalUsers ?? 0,
          totalEvents: data.totalEvents ?? 0,
          totalCheckins: data.totalCheckins ?? 0,
          checkInRate: parseFloat(String(data.checkinRate ?? data.checkInRate ?? 0)),
          totalRegistrations: data.totalRegistrations ?? 0,
        }
      } catch {
        return MOCK_STATS
      }
    },
  })
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Hôm qua'
  return `${days} ngày trước`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function useActivities(limit = 20) {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      try {
        const { data } = await import('@/lib/api-client').then(m =>
          m.apiClient.get('/activities', { params: { limit } })
        )
        const list = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return list.map((a: any) => ({
          user: a.user ?? a.username ?? a.name ?? a.actor ?? 'N/A',
          action: a.action ?? a.description ?? a.message ?? a.content ?? '',
          time: a.createdAt ? formatRelativeTime(a.createdAt) : (a.time ?? ''),
          date: a.createdAt ? formatDate(a.createdAt) : (a.date ?? ''),
        }))
      } catch {
        return []
      }
    },
    refetchInterval: 30000,
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
