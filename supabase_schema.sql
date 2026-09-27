-- ============================================================
-- FreshLeads CRM — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1) PROFILES table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company   text,
  phone     text,
  role      text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone',
    'client'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) LEADS table
CREATE TABLE IF NOT EXISTS public.leads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  homeowner_name text NOT NULL,
  address        text,
  phone          text,
  storm_date     date,
  status         text NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new','called','appointment_set','closed','dead')),
  audio_url      text,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 3) MESSAGES table
CREATE TABLE IF NOT EXISTS public.messages (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject   text NOT NULL,
  body      text NOT NULL,
  direction text NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound')),
  sent_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles: own row only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leads: clients see own, admins see all
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own leads"
  ON public.leads FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can update own leads"
  ON public.leads FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Admins can do everything with leads"
  ON public.leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Messages: own only
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own messages"
  ON public.messages FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can view all messages"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- HELPER FUNCTION for Admin lead upload (lookup user by email)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid AS $$
  SELECT id FROM auth.users WHERE email = lower(user_email) LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- MAKE AN ACCOUNT ADMIN
-- Replace 'your@email.com' with the admin's email
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
