import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
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
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', user.id)
        .order('sent_at', { ascending: false })

      if (err) throw err
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
    const { data, error: err } = await supabase
      .from('messages')
      .insert({
        client_id: user.id,
        subject,
        body,
        direction,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!err) {
      setMessages(prev => [data, ...prev])
    }
    return { data, error: err }
  }

  return {
    messages,
    loading,
    error,
    fetchMessages,
    saveMessage,
  }
}
