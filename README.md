# FreshLeads CRM

> Client portal for [FreshLeads.llc](https://freshleads.llc) — hosted at **crm.freshleads.llc**

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend/Auth/DB | Supabase |
| Email | EmailJS |
| Hosting | GitHub Pages (gh-pages branch) |
| CI/CD | GitHub Actions |

## Setup Guide

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase_schema.sql`
3. In **Settings → API**, copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon public key → `VITE_SUPABASE_ANON_KEY`
4. To make your account an admin, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
   ```

### 2. EmailJS

1. Create a free account at [emailjs.com](https://www.emailjs.com)
2. Add a **Service** connected to your Gmail/Zoho at `info@freshleads.llc`
3. Create 4 **Email Templates**:

   | Template Variable | Purpose |
   |---|---|
   | `template_contact` | Client → FreshLeads contact form |
   | `template_welcome` | Welcome email on signup |
   | `template_newleads` | New leads notification |
   | `template_autoreply` | Auto-reply to client messages |

4. Copy your **Service ID**, **Template IDs**, and **Public Key**

### 3. Environment Variables

Create a `.env` file (copy `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_CONTACT=template_contact
VITE_EMAILJS_TEMPLATE_WELCOME=template_welcome
VITE_EMAILJS_TEMPLATE_NEWLEADS=template_newleads
VITE_EMAILJS_TEMPLATE_AUTOREPLY=template_autoreply
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Local Development

```bash
npm install
npm run dev
```

### 5. Push to GitHub + Deploy

```bash
git init
git add .
git commit -m "Initial FreshLeads CRM"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/freshleads-crm.git
git push -u origin main
```

Then in the GitHub repo:
1. **Settings → Secrets → Actions** → add each `VITE_*` variable
2. **Settings → Pages** → Source: `gh-pages` branch
3. **Settings → Pages → Custom domain**: `crm.freshleads.llc`

### 6. DNS Record (at your domain registrar)

Add a CNAME record:
```
Type: CNAME
Name: crm
Value: YOUR_GITHUB_USERNAME.github.io
TTL: Auto
```

## Email Auto-Responders

| Trigger | Email Sent |
|---|---|
| User signs up | Welcome + login link |
| Password reset requested | Reset link (Supabase native) |
| Admin uploads leads | "You have X new leads!" |
| Client sends message | "We received your message" auto-reply |
| Admin broadcast | Custom announcement to all |

## Features

### Client Portal
- 📊 Lead board with status tracking (New → Called → Appointment Set → Closed → Dead)
- 🔍 Search, filter, and sort leads
- 🎵 Audio recording links per lead
- 📝 Inline notes editing
- 📈 Close rate % calculation
- 💬 Messaging system → info@freshleads.llc
- 👤 Profile management + password change

### Admin Panel
- 👥 Client list with lead counts
- 📤 CSV bulk lead upload with preview
- 📧 Announcement broadcast to all clients
- 🔒 Role-based access (admin vs client)
