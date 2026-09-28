# FreshLeads CRM — Client & Dedicated Admin Operations Portal

> Client Portal and Dedicated Admin Operations Console for **[FreshLeads.llc](https://freshleads.llc)** — hosted at **crm.freshleads.llc**

---

## ⚡ Architecture Overview

```
                      crm.freshleads.llc
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
    [ Client CRM Portal ]             [ Admin Ops Console ]
      /dashboard                        /admin/dashboard
      /messages                         /admin/leads/new  (Load Leads & Audio)
      /profile                          /admin/leads      (Master Inventory)
                                        /admin/clients    (Contractor Accounts)
                                        /admin/upload     (Bulk CSV Dispatch)
                                        /admin/messages   (Support Desk)
```

---

## 🛡️ SSL & HTTPS Configuration

The application includes built-in strict HTTPS enforcement:
1. **Automated Let's Encrypt SSL via GitHub Pages**:
   - In GitHub repository **Settings → Pages**:
     - Custom domain: `crm.freshleads.llc`
     - Check **"Enforce HTTPS"** (activates automatically once DNS propagates).
2. **Client-Side HTTPS Redirection**:
   - `index.html` automatically intercepts any unencrypted `http://` traffic on production domains and upgrades it to `https://`.
3. **DNS CNAME Setup**:
   - **Type**: `CNAME`
   - **Host / Name**: `crm`
   - **Value / Target**: `farmadvisorar-ux.github.io`
   - **TTL**: `Auto` / `300`

---

## 🎧 Call Audio Recording System

Both the **Client Lead Board** and **Admin Console** include a built-in **Interactive Audio Player**:
- **One-Click Playback**: Listen to the recorded homeowner inspection confirmation call without leaving the page.
- **Waveform Visualizer**: Animated soundwave indicator during playback.
- **Playback Controls**: Play/pause, seek scrub bar, speed adjustment (`1x`, `1.25x`, `1.5x`, `2x`), and volume/mute.
- **Direct Download**: Save audio file (`.mp3`) with one click.
- **Inspection Verification**: Displays confirmed insurance carrier (State Farm, Allstate, Travelers, etc.) and pre-set appointment window right in the player.

---

## 🛠️ Admin Dashboard (`/admin`)

The Admin Operations Console is completely **separate** from the client view:

### 1. Load Single Lead & Audio (`/admin/leads/new`)
- Assign lead to any registered contractor.
- Enter homeowner name, phone, street address, and city/state/zip.
- Select insurance carrier and storm date.
- Set pre-set inspection appointment time.
- **Attach Call Audio**:
  - **Upload Audio File**: Select an `.mp3`, `.wav`, or `.m4a` file directly from your computer.
  - **Recording URL**: Paste external links (CallRail, S3, Google Drive, Dropbox).
  - **In-Form Audio Test Player**: Test and listen to the audio recording before saving.
- Enter adjuster notes and damage details.
- Toggle instant email notification to the client.

### 2. Master Leads Inventory (`/admin/leads`)
- Search, filter by client, and filter by pipeline status across all leads.
- Play call audio recordings directly from the table.
- Edit lead details, notes, or pre-set inspection times.
- Reassign leads between clients (for replacement guarantees).
- Delete leads.

### 3. Client Contractor Accounts (`/admin/clients`)
- Manage contractor accounts and see their assigned lead counts.
- **"View Client CRM"**: One-click button to jump directly into any client's CRM portal in read/manage mode to see exactly what they see.
- Register new client accounts directly.

### 4. Bulk CSV Lead Uploader (`/admin/upload`)
- Drag-and-drop CSV files with headers: `client_email`, `homeowner_name`, `address`, `phone`, `insurance_carrier`, `audio_url`, `storm_date`, `appointment_date`.
- Auto-maps leads to contractor accounts and sends email alerts.

### 5. Support Message Desk (`/admin/messages`)
- View inquiries sent by clients to `info@freshleads.llc`.
- Dispatch direct replies back into the client's CRM portal.

---

## 📱 Client CRM Features (`/dashboard`)

- **KPI Cards**: Total Leads, New, Called, Appointments Set, Closed, and Close Rate %.
- **Lead Board**: Search, status filters, sorting, status dropdown, inline adjuster notes, and **Play Audio** modal.
- **Contact Support (`/messages`)**: Send inquiries to `info@freshleads.llc` with auto-responder confirmations.
- **Profile (`/profile`)**: Manage company info, phone, and password.

---

## 🚀 Quick Access URLs

| Section | URL | Demo Login |
|---|---|---|
| **Client Portal** | `https://crm.freshleads.llc/login` | Click *"1-Click Contractor Demo Access"* |
| **Admin Console** | `https://crm.freshleads.llc/admin/login` | Click *"1-Click Team Access"* |
| **Direct Admin Overview** | `https://crm.freshleads.llc/admin/dashboard` | Requires Admin role |
