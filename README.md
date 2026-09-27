# FreshLeads CRM

> Exclusive Client & Admin CRM Portal for **[FreshLeads.llc](https://freshleads.llc)** — hosted at **crm.freshleads.llc**

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend / BaaS** | Firebase (Auth + Cloud Firestore) & In-Browser Preview Engine |
| **Email Relay** | EmailJS (Client → `info@freshleads.llc` + Auto-responders) |
| **Hosting** | GitHub Pages (`gh-pages` branch) |
| **Custom Domain** | `crm.freshleads.llc` |
| **CI/CD** | GitHub Actions Workflow |

---

## 🎨 FreshLeads Brand Styling

- **Background**: `#07080B` (Fresh Black)
- **Primary Accent**: `#FF5C00` (Fresh Orange)
- **Cards & Borders**: `#0F1116` / `#1E2028`
- **Typography**: Inter & Plus Jakarta Sans

---

## 🚀 Key Features

### 1. Client Dashboard (`/dashboard`)
- **Key Pipeline Metrics**: Total Leads, New, Called, Appointments Set, Closed, Dead.
- **Conversion Tracking**: Automated Close Rate % calculation.
- **Interactive Lead Board**:
  - Filter by status (All, New, Called, Appt. Set, Closed, Dead).
  - Search by homeowner name, address, or phone number.
  - Sortable columns.
  - Quick status dropdown selector.
  - Direct links to **Audio Call Recordings** verifying the homeowner's inspection appointment & active insurance.
  - Inline lead notes with instant saving.

### 2. Contact Support & Messaging (`/messages`)
- Direct composition from client account to `info@freshleads.llc`.
- Automatically prefills client name and authenticated email.
- Triggers immediate confirmation auto-reply to client.
- Outbound & inbound thread message history.

### 3. Account Settings (`/profile`)
- Update contact name, roofing company name, and direct phone.
- Secure password change interface.

### 4. Admin Backend (`/admin`)
- **Client Directory (`/admin/users`)**: Overview of all registered clients, total leads assigned, and direct contact details.
- **CSV Lead Bulk Uploader (`/admin/upload`)**:
  - Drag-and-drop CSV upload.
  - Required headers: `client_email, homeowner_name, address, phone, storm_date, audio_url`.
  - Client lookup and instant pipeline assignment.
  - Automatic email notification dispatched: *"You have X new leads in your dashboard!"*
- **Announcements Broadcast (`/admin/announce`)**: Send instant email announcements to all clients.

---

## 🛠️ Quick Setup Guide

### 1. Instant Preview Mode
The app includes a built-in interactive demo engine with pre-seeded roofing leads and accounts. You can test both **Client** and **Admin** views immediately on the live link.

### 2. Connecting Firebase (Optional / Production)
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** (Email/Password provider).
3. Enable **Cloud Firestore** in test mode or paste the rules from `firestore.rules`.
4. Under Project Settings, copy your Web App config keys into your `.env` or GitHub Secrets:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=freshleads-crm.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=freshleads-crm
   VITE_FIREBASE_STORAGE_BUCKET=freshleads-crm.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=1:...
   ```

### 3. EmailJS Setup (For Messaging `info@freshleads.llc`)
1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. Connect your email service (`info@freshleads.llc`).
3. Add the keys to GitHub Secrets:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_CONTACT`
   - `VITE_EMAILJS_TEMPLATE_WELCOME`
   - `VITE_EMAILJS_TEMPLATE_NEWLEADS`
   - `VITE_EMAILJS_TEMPLATE_AUTOREPLY`
   - `VITE_EMAILJS_PUBLIC_KEY`

---

## 🌐 Custom Subdomain DNS Setup

To point `crm.freshleads.llc` to this portal:

Add a CNAME record at your DNS provider (e.g. GoDaddy, Namecheap, Cloudflare, Google Domains):
- **Type**: `CNAME`
- **Host / Name**: `crm`
- **Target / Value**: `farmadvisorar-ux.github.io`
- **TTL**: `Auto` or `300`
