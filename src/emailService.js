import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// Initialize EmailJS
emailjs.init(PUBLIC_KEY)

const TEMPLATES = {
  contact: import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT,
  welcome: import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME,
  newLeads: import.meta.env.VITE_EMAILJS_TEMPLATE_NEWLEADS,
  autoReply: import.meta.env.VITE_EMAILJS_TEMPLATE_AUTOREPLY,
}

/**
 * Send a contact message from client → info@freshleads.llc
 */
export async function sendContactMessage({ fromName, fromEmail, subject, body }) {
  return emailjs.send(SERVICE_ID, TEMPLATES.contact, {
    from_name: fromName,
    from_email: fromEmail,
    reply_to: fromEmail,
    to_email: 'info@freshleads.llc',
    subject,
    message: body,
  })
}

/**
 * Send welcome email to a newly registered client
 */
export async function sendWelcomeEmail({ toName, toEmail }) {
  return emailjs.send(SERVICE_ID, TEMPLATES.welcome, {
    to_name: toName,
    to_email: toEmail,
    login_url: 'https://crm.freshleads.llc',
    year: new Date().getFullYear(),
  })
}

/**
 * Notify client that new leads have been added to their account
 */
export async function sendNewLeadsNotification({ toName, toEmail, leadCount }) {
  return emailjs.send(SERVICE_ID, TEMPLATES.newLeads, {
    to_name: toName,
    to_email: toEmail,
    lead_count: leadCount,
    dashboard_url: 'https://crm.freshleads.llc/dashboard',
    year: new Date().getFullYear(),
  })
}

/**
 * Auto-reply confirming we received their message
 */
export async function sendAutoReply({ toName, toEmail, subject }) {
  return emailjs.send(SERVICE_ID, TEMPLATES.autoReply, {
    to_name: toName,
    to_email: toEmail,
    subject_ref: subject,
    year: new Date().getFullYear(),
  })
}
