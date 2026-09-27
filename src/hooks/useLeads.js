import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useLeads() {
  const { user, isAdmin } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async (clientId = null) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      // Admins can fetch leads for a specific client
      if (isAdmin && clientId) {
        query = query.eq('client_id', clientId)
      } else if (!isAdmin) {
        query = query.eq('client_id', user.id)
      }

      const { data, error: err } = await query
      if (err) throw err
      setLeads(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  async function updateLeadStatus(leadId, status) {
    const { error: err } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (!err) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
    }
    return { error: err }
  }

  async function updateLeadNotes(leadId, notes) {
    const { error: err } = await supabase
      .from('leads')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (!err) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes } : l))
    }
    return { error: err }
  }

  async function bulkInsertLeads(leadsArray) {
    const { data, error: err } = await supabase
      .from('leads')
      .insert(leadsArray)
      .select()

    if (!err) {
      await fetchLeads()
    }
    return { data, error: err }
  }

  // Stats computed from leads
  const stats = {
    total: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    called: leads.filter(l => l.status === 'called').length,
    appointmentSet: leads.filter(l => l.status === 'appointment_set').length,
    closed: leads.filter(l => l.status === 'closed').length,
    dead: leads.filter(l => l.status === 'dead').length,
  }

  return {
    leads,
    loading,
    error,
    stats,
    fetchLeads,
    updateLeadStatus,
    updateLeadNotes,
    bulkInsertLeads,
  }
}
