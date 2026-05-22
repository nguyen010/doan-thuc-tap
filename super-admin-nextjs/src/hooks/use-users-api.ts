"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { MOCK_USERS } from '@/lib/mock-data'
import { User, UserRole } from '@/types'

const ROLE_MAP: Record<string, UserRole> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EVENT_MANAGER: 'Manager',
  STUDENT: 'Student',
}

const ROLE_MAP_REVERSE: Record<string, string> = {
  'Super Admin': 'SUPER_ADMIN',
  Admin: 'ADMIN',
  Manager: 'EVENT_MANAGER',
  Student: 'STUDENT',
}

function toUiUser(u: any): User {
  return {
    id: u.id,
    name: u.username || u.name || u.email,
    email: u.email,
    role: (ROLE_MAP[u.role] ?? u.role) as UserRole,
    status: u.active !== false ? 'HOẠT ĐỘNG' : 'KHOÁ',
  }
}

export function useUsersQuery(search?: string) {
  return useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      try {
        const data = await userService.getAll({ search, limit: 200 })
        const list: any[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        return list.map(toUiUser) as User[]
      } catch {
        return MOCK_USERS as User[]
      }
    },
  })
}

export function useCreateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { username: string; email: string; password: string; role: string }) =>
      userService.create({ ...p, role: ROLE_MAP_REVERSE[p.role] ?? p.role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { username?: string; email?: string; role?: string } }) =>
      userService.update(id, {
        ...payload,
        ...(payload.role ? { role: ROLE_MAP_REVERSE[payload.role] ?? payload.role } : {}),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useActivateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}
