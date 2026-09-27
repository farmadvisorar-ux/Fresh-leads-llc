import { useState, useEffect, useCallback } from 'react'
import { api } from '../firebase'
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
      const data = await api.getLeads(user.uid || user.id, isAdmin, clientId)
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
    try {
      await api.updateLeadStatus(leadId, status)
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status, updated_at: new Date().toISOString() } : l))
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  async function updateLeadNotes(leadId, notes) {
    try {
      await api.updateLeadNotes(leadId, notes)
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes, updated_at: new Date().toISOString() } : l))
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  async function bulkInsertLeads(leadsArray) {
    try {
      const res = await api.bulkInsertLeads(leadsArray)
      await fetchLeads()
      return { data: res, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
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
