import api from './axios'
import type { Page, AppNotification } from '../types'

export const getNotifications = (page = 0, size = 20) =>
  api.get<Page<AppNotification>>(`/api/notifications?page=${page}&size=${size}`).then(r => r.data)

export const getUnreadCount = () =>
  api.get<{ count: number }>('/api/notifications/unread-count').then(r => r.data.count)

export const markAsRead = (id: string) =>
  api.put(`/api/notifications/${id}/read`)

export const markAllAsRead = () =>
  api.put('/api/notifications/read-all')
