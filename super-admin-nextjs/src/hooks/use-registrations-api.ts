"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { registrationService } from '@/services/registration.service'
import { MOCK_REGISTRATIONS } from '@/lib/mock-data'
import { Registration } from '@/types'

const STATUS_MAP: Record<string, Registration['status']> = {
  REGISTERED: 'CHỜ XỬ LÝ',
  CHECKED_IN: 'ĐÃ ĐIỂM DANH',
  CANCELLED: 'ĐÃ HỦY',
}

function toUiRegistration(r: Record<string, unknown>, eventName?: string): Registration {
  const user = r.user as Record<string, unknown> | undefined;
  const event = r.event as Record<string, unknown> | undefined;
  return {
    id: String(r.id),
    studentId: (r.studentId || user?.mssv || user?.studentId || r.userId || '') as string,
    faculty: (r.faculty || user?.faculty || user?.department || '') as string,
    eventId: String(r.eventId || ''),
    eventName: (eventName || r.eventName || event?.title || '') as string,
    userName: (r.userName || user?.username || user?.name || '') as string,
    userEmail: (r.userEmail || user?.email || '') as string,
    status: STATUS_MAP[r.status as string] ?? (r.status as Registration['status']) ?? 'CHỜ XỬ LÝ',
    registrationDate: (r.registrationDate || r.createdAt || new Date().toISOString()) as string,
  }
}

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: ['registrations', 'event', eventId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/events/${eventId}/registrations`)
        const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        return list.map(r => toUiRegistration(r)) as Registration[]
      } catch {
        return MOCK_REGISTRATIONS.filter(r => r.eventId === eventId)
      }
    },
    enabled: !!eventId,
    refetchInterval: 8000,
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
            const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
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
    refetchInterval: 8000,
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
