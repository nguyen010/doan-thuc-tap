"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService, CreateEventPayload } from '@/services/event.service'
import { MOCK_EVENTS } from '@/lib/mock-data'

const API_STATUS_MAP: Record<string, 'SẮP DIỄN RA' | 'ĐANG DIỄN RA' | 'ĐÃ KẾT THÚC' | 'ĐÃ HỦY'> = {
  OPEN: 'SẮP DIỄN RA',
  PUBLISHED: 'SẮP DIỄN RA',
  UPCOMING: 'SẮP DIỄN RA',
  ONGOING: 'ĐANG DIỄN RA',
  IN_PROGRESS: 'ĐANG DIỄN RA',
  CLOSED: 'ĐÃ KẾT THÚC',
  COMPLETED: 'ĐÃ KẾT THÚC',
  CANCELLED: 'ĐÃ HỦY',
}

function toUiEvent(e: any) {
  return {
    id: String(e.id),
    title: e.title ?? '',
    description: e.description ?? '',
    location: e.location ?? '',
    date: e.startDate ? new Date(e.startDate).toLocaleDateString('vi-VN') : '',
    status: (API_STATUS_MAP[e.status] ?? 'SẮP DIỄN RA') as 'SẮP DIỄN RA' | 'ĐANG DIỄN RA' | 'ĐÃ KẾT THÚC' | 'ĐÃ HỦY',
    imageUrl: e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    capacity: e.maxParticipants ?? 0,
    registeredCount: e.registrationCount ?? e.registered ?? 0,
    startDate: e.startDate ?? '',
    endDate: e.endDate ?? '',
  }
}

export function useEventsQuery() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const data = await eventService.getAll()
        const list: any[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        return list.map(toUiEvent)
      } catch {
        return MOCK_EVENTS
      }
    },
  })
}

export function useEventQuery(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      try {
        const data = await eventService.getOne(id)
        return toUiEvent(data)
      } catch {
        return MOCK_EVENTS.find(e => e.id === id) ?? null
      }
    },
    enabled: !!id,
  })
}

export function useEventRegistrationsQuery(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'registrations'],
    queryFn: async () => {
      const data = await eventService.getRegistrations(eventId)
      return Array.isArray(data) ? data : (data?.data ?? [])
    },
    enabled: !!eventId,
  })
}

export function useCreateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEventPayload> }) =>
      eventService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
