import { create } from 'zustand'
import type { AppNotification } from '../types'
import { getUnreadCount } from '../api/notifications'

interface NotificationState {
  unreadCount: number
  notifications: AppNotification[]
  eventSource: EventSource | null
  setUnreadCount: (count: number) => void
  addNotification: (n: AppNotification) => void
  markRead: (id: string) => void
  markAllRead: () => void
  connect: (token: string) => void
  disconnect: () => void
  fetchUnreadCount: () => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  unreadCount: 0,
  notifications: [],
  eventSource: null,

  setUnreadCount: (count) => set({ unreadCount: count }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  fetchUnreadCount: () => {
    getUnreadCount().then((count) => set({ unreadCount: count })).catch(() => {})
  },

  connect: (token) => {
    const existing = get().eventSource
    if (existing) existing.close()

    const es = new EventSource(`/api/notifications/stream?token=${token}`)

    es.addEventListener('notification', (event) => {
      try {
        const notification: AppNotification = JSON.parse(event.data)
        get().addNotification(notification)
      } catch { /* ignore parse errors */ }
    })

    es.onerror = () => {
      // SSE will auto-reconnect; no action needed
    }

    set({ eventSource: es })
  },

  disconnect: () => {
    const es = get().eventSource
    if (es) {
      es.close()
      set({ eventSource: null, notifications: [], unreadCount: 0 })
    }
  },
}))
