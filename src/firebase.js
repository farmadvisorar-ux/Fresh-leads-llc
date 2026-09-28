import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  !firebaseConfig.apiKey.includes('placeholder')
)

let app = null
let auth = null
let db = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (err) {
    console.warn('Firebase initialization error, falling back to local storage engine:', err)
  }
}

// -------------------------------------------------------------
// LOCAL / DEMO STORAGE ENGINE (For instant testing without setup)
// -------------------------------------------------------------
const STORAGE_KEYS = {
  CURRENT_USER: 'freshleads_current_user',
  PROFILES: 'freshleads_profiles',
  LEADS: 'freshleads_leads_v2',
  MESSAGES: 'freshleads_messages_v2',
}

const DEFAULT_PROFILES = [
  {
    id: 'client-user-1',
    email: 'client@freshleads.llc',
    full_name: 'John Miller',
    company: 'Miller Roofing Solutions',
    phone: '(214) 555-0192',
    role: 'client',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'client-user-2',
    email: 'apex@roofingpros.com',
    full_name: 'Marcus Vance',
    company: 'Apex Storm Restoration',
    phone: '(817) 555-8821',
    role: 'client',
    created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'admin-user-1',
    email: 'admin@freshleads.llc',
    full_name: 'FreshLeads Ops Team',
    company: 'FreshLeads LLC HQ',
    phone: '(800) 555-0100',
    role: 'admin',
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  }
]

// Sample hosted audio recordings with real sound or demonstration audio
const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    client_id: 'client-user-1',
    homeowner_name: 'Robert Henderson',
    address: '4821 Meadowview Ln, Plano, TX 75024',
    phone: '(469) 555-2981',
    insurance_carrier: 'State Farm',
    storm_date: '2026-05-18',
    appointment_date: 'Tomorrow, 2:00 PM',
    status: 'new',
    audio_url: SAMPLE_AUDIO,
    audio_filename: 'call_rec_henderson_robert.mp3',
    notes: 'Homeowner observed ping-pong ball size hail on east-facing slope. Confirmed active State Farm homeowner policy ($1,000 deductible). Both homeowners will be present for inspection.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-2',
    client_id: 'client-user-1',
    homeowner_name: 'Sarah Jenkins',
    address: '1209 Oak Ridge Dr, Frisco, TX 75034',
    phone: '(972) 555-4819',
    insurance_carrier: 'Allstate',
    storm_date: '2026-05-18',
    appointment_date: 'Thursday, 10:30 AM',
    status: 'called',
    audio_url: SAMPLE_AUDIO,
    audio_filename: 'call_rec_jenkins_sarah.mp3',
    notes: 'Called left voicemail. Spouse answered second call and agreed to pre-set inspection time. Noted minor leak in master bedroom ceiling.',
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-3',
    client_id: 'client-user-1',
    homeowner_name: 'Michael & Claire Zhang',
    address: '8910 Whispering Pines, McKinney, TX 75071',
    phone: '(214) 555-7734',
    insurance_carrier: 'Travelers',
    storm_date: '2026-04-22',
    appointment_date: 'Friday, 1:00 PM',
    status: 'appointment_set',
    audio_url: SAMPLE_AUDIO,
    audio_filename: 'call_rec_zhang_inspection.mp3',
    notes: 'Inspection confirmed for Friday at 1:00 PM with Claire. Roof is 14 years old Architectural shingle. Several missing ridge caps from high winds.',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-4',
    client_id: 'client-user-1',
    homeowner_name: 'David Alvarez',
    address: '3340 Timberline Trail, Allen, TX 75013',
    phone: '(972) 555-3120',
    insurance_carrier: 'Liberty Mutual',
    storm_date: '2026-04-22',
    appointment_date: 'Completed',
    status: 'closed',
    audio_url: SAMPLE_AUDIO,
    audio_filename: 'call_rec_alvarez_preset.mp3',
    notes: 'Claim approved! Full roof replacement authorized by adjuster. Contract signed. Total claim value: $19,850.',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-5',
    client_id: 'client-user-2',
    homeowner_name: 'Gregory & Brenda Holt',
    address: '502 Highland Park Cir, Fort Worth, TX 76107',
    phone: '(817) 555-9012',
    insurance_carrier: 'Farmers',
    storm_date: '2026-06-02',
    appointment_date: 'Wednesday, 4:00 PM',
    status: 'new',
    audio_url: SAMPLE_AUDIO,
    audio_filename: 'call_rec_holt_ftworth.mp3',
    notes: 'Gutters dented and window screens torn from 2-inch hail. Homeowner wants roofer to meet insurance adjuster on-site.',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  }
]

const DEFAULT_MESSAGES = [
  {
    id: 'msg-1',
    client_id: 'client-user-1',
    subject: 'Welcome to FreshLeads CRM',
    body: 'Welcome to your client portal! Your pre-set roofing leads with audio recordings are loaded into your dashboard. If you need any adjustments to your lead delivery cadence or zip codes, reply directly here or email info@freshleads.llc.',
    direction: 'inbound',
    sent_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    client_id: 'client-user-1',
    subject: 'Question on Colin County leads schedule',
    body: 'Hey FreshLeads team, can we increase our delivery to 5 pre-set inspections per week starting next Monday?',
    direction: 'outbound',
    sent_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    client_id: 'client-user-1',
    subject: 'Re: Question on Colin County leads schedule',
    body: 'Absolutely John! We have calibrated your dispatch schedule for 5 verified inspections per week starting Monday. You will receive real-time audio and details as appointments are booked.',
    direction: 'inbound',
    sent_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  }
]

function getLocal(key, defaultVal) {
  try {
    const val = localStorage.getItem(key)
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultVal))
      return defaultVal
    }
    return JSON.parse(val)
  } catch {
    return defaultVal
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (err) {
    console.error('Local storage write error:', err)
  }
}

// Initialize seed data if empty
if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
  setLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
}
if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
  setLocal(STORAGE_KEYS.LEADS, DEFAULT_LEADS)
}
if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
  setLocal(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES)
}

// -------------------------------------------------------------
// UNIFIED DATA SERVICE API (Firebase with Local Fallback)
// -------------------------------------------------------------
export const api = {
  isLive: isFirebaseConfigured,

  // Auth: Sign Up
  async signUp({ email, password, fullName, company, phone }) {
    if (isFirebaseConfigured && auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await fbUpdateProfile(cred.user, { displayName: fullName })
      const profile = {
        id: cred.user.uid,
        email,
        full_name: fullName,
        company,
        phone,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'client',
        created_at: new Date().toISOString(),
      }
      await setDoc(doc(db, 'profiles', cred.user.uid), profile)
      return { user: cred.user, profile }
    } else {
      // Local fallback
      const profiles = getLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
      const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase())
      if (existing) throw new Error('An account with this email already exists.')
      
      const newId = 'user-' + Date.now()
      const newProfile = {
        id: newId,
        email,
        full_name: fullName,
        company,
        phone,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'client',
        created_at: new Date().toISOString(),
      }
      profiles.push(newProfile)
      setLocal(STORAGE_KEYS.PROFILES, profiles)
      const user = { uid: newId, email, displayName: fullName }
      setLocal(STORAGE_KEYS.CURRENT_USER, { user, profile: newProfile })
      return { user, profile: newProfile }
    }
  },

  // Auth: Sign In
  async signIn({ email, password }) {
    if (isFirebaseConfigured && auth && db) {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const docSnap = await getDoc(doc(db, 'profiles', cred.user.uid))
      const profile = docSnap.exists() ? docSnap.data() : {
        id: cred.user.uid,
        email: cred.user.email,
        full_name: cred.user.displayName || email.split('@')[0],
        role: email.toLowerCase().includes('admin') ? 'admin' : 'client'
      }
      return { user: cred.user, profile }
    } else {
      // Local fallback
      const profiles = getLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
      let found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase())
      
      if (!found) {
        const newId = 'user-' + Date.now()
        found = {
          id: newId,
          email,
          full_name: email.split('@')[0],
          company: 'Roofing Contractor LLC',
          phone: '(555) 000-0000',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'client',
          created_at: new Date().toISOString(),
        }
        profiles.push(found)
        setLocal(STORAGE_KEYS.PROFILES, profiles)
      }
      
      const user = { uid: found.id, email: found.email, displayName: found.full_name }
      setLocal(STORAGE_KEYS.CURRENT_USER, { user, profile: found })
      return { user, profile: found }
    }
  },

  // Auth: Sign Out
  async signOut() {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth)
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  // Auth: Password Reset
  async resetPassword(email) {
    if (isFirebaseConfigured && auth) {
      return sendPasswordResetEmail(auth, email)
    }
    return true
  },

  // Auth: Update Password
  async updatePassword(newPassword) {
    if (isFirebaseConfigured && auth?.currentUser) {
      return fbUpdatePassword(auth.currentUser, newPassword)
    }
    return true
  },

  // Auth: Update Profile
  async updateProfile(userId, updates) {
    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'profiles', userId)
      await updateDoc(ref, updates)
      const snap = await getDoc(ref)
      return snap.data()
    } else {
      const profiles = getLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
      const idx = profiles.findIndex(p => p.id === userId)
      if (idx !== -1) {
        profiles[idx] = { ...profiles[idx], ...updates }
        setLocal(STORAGE_KEYS.PROFILES, profiles)
        const current = getLocal(STORAGE_KEYS.CURRENT_USER, null)
        if (current) {
          current.profile = profiles[idx]
          setLocal(STORAGE_KEYS.CURRENT_USER, current)
        }
        return profiles[idx]
      }
      return updates
    }
  },

  // Leads: Fetch
  async getLeads(userId, isAdmin = false, filterClientId = null) {
    if (isFirebaseConfigured && db) {
      const leadsCol = collection(db, 'leads')
      let q
      if (isAdmin && filterClientId) {
        q = query(leadsCol, where('client_id', '==', filterClientId), orderBy('created_at', 'desc'))
      } else if (!isAdmin) {
        q = query(leadsCol, where('client_id', '==', userId), orderBy('created_at', 'desc'))
      } else {
        q = query(leadsCol, orderBy('created_at', 'desc'))
      }
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } else {
      const leads = getLocal(STORAGE_KEYS.LEADS, DEFAULT_LEADS)
      if (isAdmin && filterClientId) {
        return leads.filter(l => l.client_id === filterClientId)
      } else if (!isAdmin) {
        return leads.filter(l => l.client_id === userId || l.client_id === 'client-user-1')
      }
      return leads
    }
  },

  // Leads: Create Single Lead (Admin)
  async createSingleLead(leadData) {
    const newLead = {
      ...leadData,
      status: leadData.status || 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'leads'), newLead)
      return { id: docRef.id, ...newLead }
    } else {
      const leads = getLocal(STORAGE_KEYS.LEADS, DEFAULT_LEADS)
      const created = { id: 'lead-' + Date.now(), ...newLead }
      leads.unshift(created)
      setLocal(STORAGE_KEYS.LEADS, leads)
      return created
    }
  },

  // Leads: Update (Full or partial)
  async updateLead(leadId, updates) {
    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'leads', leadId)
      await updateDoc(ref, { ...updates, updated_at: new Date().toISOString() })
    } else {
      const leads = getLocal(STORAGE_KEYS.LEADS, DEFAULT_LEADS)
      const idx = leads.findIndex(l => l.id === leadId)
      if (idx !== -1) {
        leads[idx] = { ...leads[idx], ...updates, updated_at: new Date().toISOString() }
        setLocal(STORAGE_KEYS.LEADS, leads)
        return leads[idx]
      }
    }
  },

  // Leads: Delete Lead (Admin)
  async deleteLead(leadId) {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'leads', leadId))
    } else {
      const leads = getLocal(STORAGE_KEYS.LEADS, DEFAULT_LEADS)
      const filtered = leads.filter(l => l.id !== leadId)
      setLocal(STORAGE_KEYS.LEADS, filtered)
    }
    return true
  },

  // Leads: Update Status
  async updateLeadStatus(leadId, status) {
    return this.updateLead(leadId, { status })
  },

  // Leads: Update Notes
  async updateLeadNotes(leadId, notes) {
    return this.updateLead(leadId, { notes })
  },

  // Leads: Reassign Lead to another Client
  async reassignLead(leadId, newClientId) {
    return this.updateLead(leadId, { client_id: newClientId })
  },

  // Leads: Bulk Insert (Admin)
  async bulkInsertLeads(leadsArray) {
    if (isFirebaseConfigured && db) {
      const leadsCol = collection(db, 'leads')
      const promises = leadsArray.map(l => addDoc(leadsCol, { ...l, created_at: new Date().toISOString() }))
      await Promise.all(promises)
      return { count: leadsArray.length }
    } else {
      const leads = getLocal(STORAGE_KEYS.LEADS, DEFAULT_LEADS)
      const formatted = leadsArray.map((l, i) => ({
        id: 'lead-' + Date.now() + '-' + i,
        ...l,
        created_at: new Date().toISOString(),
      }))
      const updated = [...formatted, ...leads]
      setLocal(STORAGE_KEYS.LEADS, updated)
      return { count: leadsArray.length }
    }
  },

  // Profiles: Get All Clients (Admin)
  async getClients() {
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(query(collection(db, 'profiles'), where('role', '==', 'client')))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } else {
      const profiles = getLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
      return profiles.filter(p => p.role === 'client')
    }
  },

  // Profiles: Create Client Account (Admin)
  async createClientAccount({ email, fullName, company, phone }) {
    const newProfile = {
      id: 'client-' + Date.now(),
      email,
      full_name: fullName,
      company,
      phone,
      role: 'client',
      created_at: new Date().toISOString(),
    }
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'profiles', newProfile.id), newProfile)
    } else {
      const profiles = getLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
      profiles.unshift(newProfile)
      setLocal(STORAGE_KEYS.PROFILES, profiles)
    }
    return newProfile
  },

  // Profiles: Find by Email (Admin)
  async findProfileByEmail(email) {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'profiles'), where('email', '==', email.toLowerCase()))
      const snap = await getDocs(q)
      if (snap.empty) return null
      return { id: snap.docs[0].id, ...snap.docs[0].data() }
    } else {
      const profiles = getLocal(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES)
      return profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null
    }
  },

  // Messages: Get for Client
  async getMessages(userId) {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'messages'), where('client_id', '==', userId), orderBy('sent_at', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } else {
      const messages = getLocal(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES)
      return messages.filter(m => m.client_id === userId || m.client_id === 'client-user-1')
    }
  },

  // Messages: Get ALL Messages for Admin Inbox
  async getAllMessages() {
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(query(collection(db, 'messages'), orderBy('sent_at', 'desc')))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } else {
      return getLocal(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES)
    }
  },

  // Messages: Send / Save
  async saveMessage({ clientId, subject, body, direction = 'outbound' }) {
    const newMsg = {
      client_id: clientId,
      subject,
      body,
      direction,
      sent_at: new Date().toISOString(),
    }
    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'messages'), newMsg)
      return { id: docRef.id, ...newMsg }
    } else {
      const messages = getLocal(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES)
      const saved = { id: 'msg-' + Date.now(), ...newMsg }
      messages.unshift(saved)
      setLocal(STORAGE_KEYS.MESSAGES, messages)
      return saved
    }
  },

  // Auth State Listener
  onAuthChange(callback) {
    if (isFirebaseConfigured && auth && db) {
      return onAuthStateChanged(auth, async (user) => {
        if (user) {
          const snap = await getDoc(doc(db, 'profiles', user.uid))
          const profile = snap.exists() ? snap.data() : {
            id: user.uid,
            email: user.email,
            full_name: user.displayName || user.email.split('@')[0],
            role: user.email.toLowerCase().includes('admin') ? 'admin' : 'client'
          }
          callback({ user, profile })
        } else {
          callback({ user: null, profile: null })
        }
      })
    } else {
      const current = getLocal(STORAGE_KEYS.CURRENT_USER, null)
      if (current) {
        callback(current)
      } else {
        // Default to demo client for immediate review
        const demoProfile = DEFAULT_PROFILES[0]
        const demoUser = { uid: demoProfile.id, email: demoProfile.email, displayName: demoProfile.full_name }
        callback({ user: demoUser, profile: demoProfile })
      }
      return () => {}
    }
  }
}
