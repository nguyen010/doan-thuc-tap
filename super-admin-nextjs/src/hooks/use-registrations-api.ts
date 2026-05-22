"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { registrationService } from '@/services/registration.service'
import { MOCK_REGISTRATIONS } from '@/lib/mock-data'
import { Registration } from '@/types'

const STATUS_MAP: Record<string, Registration['status']> = {
  CHECKED_IN: 'ĐÃ ĐIỂM DANH',
  CONFIRMED: 'ĐÃ XÁC NHẬN',
  PENDING: 'CHỜ XỬ LÝ',
  CANCELLED: 'ĐÃ HỦY',
}

function toUiRegistration(r: any, eventName?: string): Registration {
  return {
    id: String(r.id),
    studentId: r.studentId || r.user?.studentId || r.userId || '',
    faculty: r.faculty || r.user?.faculty || r.user?.department || '',
    eventId: String(r.eventId || ''),
    eventName: eventName || r.eventName || r.event?.title || '',
    userName: r.userName || r.user?.username || r.user?.name || '',
    userEmail: r.userEmail || r.user?.email || '',
    status: STATUS_MAP[r.status] ?? (r.status as Registration['status']) ?? 'CHỜ XỬ LÝ',
    registrationDate: r.registrationDate || r.createdAt || new Date().toISOString(),
  }
}

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: ['registrations', 'event', eventId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/events/${eventId}/registrations`)
        const list: any[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        return list.map(r => toUiRegistration(r)) as Registration[]
      } catch {
        return MOCK_REGISTRATIONS.filter(r => r.eventId === eventId)
      }
    },
    enabled: !!eventId,
  })
}

export function useAllRegistrationsQuery(events: Array<{ id: string; title: string }>) {
  return useQuery({
    queryKey: ['registrations', 'all', events.map(e => e.id).join(',')],
    queryFn: async () => {
      if (!events.length) return MOCK_REGISTRATIONS as Registration[]
      try {
        const results = await Promise.allSettled(
          events.map(async event => {
            const { data } = await apiClient.get(`/events/${event.id}/registrations`)
            const list: any[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
            return list.map(r => toUiRegistration(r, event.title))
          })
        )
        const merged: Registration[] = results
          .filter((r): r is PromiseFulfilledResult<Registration[]> => r.status === 'fulfilled')
          .flatMap(r => r.value)
        return merged.length ? merged : MOCK_REGISTRATIONS
      } catch {
        return MOCK_REGISTRATIONS as Registration[]
      }
    },
    enabled: events.length > 0,
  })
}

export function useManualCheckinMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: Record<string, unknown> }) =>
      registrationService.manualCheckin(eventId, payload),
    onSuccess: (_data, { eventId }) => {
      qc.invalidateQueries({ queryKey: ['registrations', 'event', eventId] })
      qc.invalidateQueries({ queryKey: ['registrations', 'all'] })
    },
  })
}
