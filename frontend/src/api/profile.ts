import api from './axios'
import type { User } from '../types'

export const getProfile = () =>
  api.get<User>('/api/users/me').then((r) => r.data)

export const updateProfile = (firstName: string, lastName: string) =>
  api.patch<User>('/api/users/me', { firstName, lastName }).then((r) => r.data)

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/api/users/me/password', { currentPassword, newPassword })
