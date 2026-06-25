import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('notif_enabled') === 'true'
  })
  const channelsRef = useRef([])

  useEffect(() => {
    if (!enabled) return

    // Subscribe to trap status changes
    const trapChannel = supabase
      .channel('trap-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'traps',
      }, (payload) => {
        if (payload.new.status === 'needs_pickup' && payload.old.status !== 'needs_pickup') {
          const notif = {
            id: `trap-${Date.now()}`,
            type: 'trap_captured',
            title: '🪤 Cat Captured!',
            message: `A trap needs pickup! ${payload.new.notes || ''}`.trim(),
            timestamp: new Date().toISOString(),
            read: false,
            link: '/',
          }
          addNotification(notif)
        }
      })
      .subscribe()

    // Subscribe to new colonies
    const colonyChannel = supabase
      .channel('colony-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'colonies',
      }, (payload) => {
        const notif = {
          id: `colony-${Date.now()}`,
          type: 'new_colony',
          title: '📍 New Colony Reported',
          message: `"${payload.new.name}" has been added to the map.`,
          timestamp: new Date().toISOString(),
          read: false,
          link: `/colony/${payload.new.id}`,
        }
        addNotification(notif)
      })
      .subscribe()

    // Subscribe to recovery updates
    const recoveryChannel = supabase
      .channel('recovery-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'recoveries',
      }, (payload) => {
        if (payload.new.status === 'released' && payload.old.status !== 'released') {
          const notif = {
            id: `recovery-${Date.now()}`,
            type: 'cat_released',
            title: '🎉 Cat Released!',
            message: 'A cat has been cleared for release back to the colony.',
            timestamp: new Date().toISOString(),
            read: false,
            link: '/recovery',
          }
          addNotification(notif)
        }
      })
      .subscribe()

    channelsRef.current = [trapChannel, colonyChannel, recoveryChannel]

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
    }
  }, [enabled])

  function addNotification(notif) {
    setNotifications(prev => [notif, ...prev].slice(0, 50))
    setUnreadCount(prev => prev + 1)

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/vite.svg',
      })
    }

    // Fallback toast
    toast(notif.message, {
      icon: notif.type === 'trap_captured' ? '🪤' : notif.type === 'new_colony' ? '📍' : '🎉',
      duration: 5000,
    })
  }

  function toggleNotifications() {
    if (!enabled) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      localStorage.setItem('notif_enabled', 'true')
      setEnabled(true)
      toast.success('Notifications enabled')
    } else {
      localStorage.setItem('notif_enabled', 'false')
      setEnabled(false)
      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []
      toast.success('Notifications disabled')
    }
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  function clearAll() {
    setNotifications([])
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    enabled,
    toggleNotifications,
    markAllRead,
    clearAll,
  }
}
