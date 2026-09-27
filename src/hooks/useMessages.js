import { useState, useEffect, useCallback } from 'react'
import { api } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMessages = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await api.getMessages(user.uid || user.id)
      setMessages(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  async function saveMessage({ subject, body, direction = 'outbound' }) {
    try {
      const saved = await api.saveMessage({
        clientId: user.uid || user.id,
        subject,
        body,
        direction,
      })
      setMessages(prev => [saved, ...prev])
      return { data: saved, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  return {
    messages,
    loading,
    error,
    fetchMessages,
    saveMessage,
  }
}
