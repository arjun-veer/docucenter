-- ============================================================================
-- JobExam Platform - Initial Database Schema
-- ============================================================================
-- This migration creates all tables, enums, RLS policies, triggers, functions,
-- indexes, and storage buckets for the JobExam platform.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin', 'ambassador');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'internship', 'contract', 'freelance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('draft', 'active', 'closed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'shortlisted', 'rejected', 'accepted', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.drive_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.exam_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('exam', 'job', 'placement', 'blog', 'document', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.agent_status AS ENUM ('active', 'paused', 'error', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.blog_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS (defined before tables that use them in RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. colleges
CREATE TABLE IF NOT EXISTS public.colleges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text NOT NULL UNIQUE,
  city        text,
  state       text,
  university  text,
  website_url text,
  logo_url    text,
  student_count integer,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role            public.user_role NOT NULL DEFAULT 'user',
  full_name       text,
  avatar_url      text,
  phone           text,
  email           text,
  college_id      uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  graduation_year integer,
  degree          text,
  branch          text,
  bio             text,
  resume_url      text,
  skills          text[],
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 3. agents (defined before exams because exams references agents)
CREATE TABLE IF NOT EXISTS public.agents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  source_type     text NOT NULL,
  source_config   jsonb NOT NULL DEFAULT '{}',
  schedule        text,
  status          public.agent_status NOT NULL DEFAULT 'active',
  last_run_at     timestamptz,
  last_run_result text,
  exams_found     integer NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 4. exams
CREATE TABLE IF NOT EXISTS public.exams (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  category            text NOT NULL,
  description         text,
  registration_start  timestamptz,
  registration_end    timestamptz,
  exam_date           timestamptz,
  result_date         timestamptz,
  answer_key_date     timestamptz,
  website_url         text,
  eligibility         text,
  application_fee     text,
  syllabus_url        text,
  is_verified         boolean NOT NULL DEFAULT false,
  status              public.exam_status NOT NULL DEFAULT 'pending',
  source              text NOT NULL DEFAULT 'manual',
  agent_id            uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tags                text[],
  meta                jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 5. exam_subscriptions
CREATE TABLE IF NOT EXISTS public.exam_subscriptions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id        uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  notify_updates boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, exam_id)
);

-- 6. jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL,
  slug                 text NOT NULL UNIQUE,
  company_name         text NOT NULL,
  company_logo_url     text,
  description          text NOT NULL,
  requirements         text,
  location             text,
  remote_allowed       boolean NOT NULL DEFAULT false,
  job_type             public.job_type NOT NULL DEFAULT 'full_time',
  salary_min           numeric,
  salary_max           numeric,
  salary_currency      text NOT NULL DEFAULT 'INR',
  experience_min       integer,
  experience_max       integer,
  skills_required      text[],
  eligibility          text,
  application_url      text,
  application_deadline timestamptz,
  status               public.job_status NOT NULL DEFAULT 'active',
  posted_by            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id           uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  is_featured          boolean NOT NULL DEFAULT false,
  views_count          integer NOT NULL DEFAULT 0,
  applications_count   integer NOT NULL DEFAULT 0,
  tags                 text[],
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- 7. job_applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url   text,
  cover_letter text,
  status       public.application_status NOT NULL DEFAULT 'pending',
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- 8. placement_drives
CREATE TABLE IF NOT EXISTS public.placement_drives (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  text NOT NULL,
  slug                   text NOT NULL UNIQUE,
  company_name           text NOT NULL,
  company_logo_url       text,
  description            text,
  college_id             uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  drive_date             timestamptz,
  registration_deadline  timestamptz,
  eligibility            text,
  min_cgpa               numeric,
  package_offered        text,
  roles_offered          text[],
  process_rounds         text[],
  status                 public.drive_status NOT NULL DEFAULT 'upcoming',
  created_by             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  views_count            integer NOT NULL DEFAULT 0,
  applications_count     integer NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- 9. placement_applications
CREATE TABLE IF NOT EXISTS public.placement_applications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id      uuid NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url    text,
  status        public.application_status NOT NULL DEFAULT 'pending',
  current_round text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(drive_id, user_id)
);

-- 10. blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  content         text NOT NULL,
  excerpt         text,
  cover_image_url text,
  author_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          public.blog_status NOT NULL DEFAULT 'draft',
  exam_tags       uuid[],
  tags            text[],
  is_featured     boolean NOT NULL DEFAULT false,
  likes_count     integer NOT NULL DEFAULT 0,
  comments_count  integer NOT NULL DEFAULT 0,
  views_count     integer NOT NULL DEFAULT 0,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 11. blog_likes
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id    uuid NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blog_id, user_id)
);

-- 12. blog_comments
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id    uuid NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  content    text NOT NULL,
  is_edited  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         public.notification_type NOT NULL,
  title        text NOT NULL,
  message      text NOT NULL,
  link         text,
  reference_id uuid,
  is_read      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 14. user_documents
CREATE TABLE IF NOT EXISTS public.user_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name    text NOT NULL,
  file_type    text NOT NULL,
  file_size    integer NOT NULL,
  storage_path text NOT NULL,
  category     text NOT NULL DEFAULT 'general',
  description  text,
  is_verified  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 15. agent_logs
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  status        text NOT NULL,
  exams_found   integer NOT NULL DEFAULT 0,
  exams_added   integer NOT NULL DEFAULT 0,
  error_message text,
  details       jsonb,
  duration_ms   integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 16. bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON public.profiles(college_id);

-- exams
CREATE INDEX IF NOT EXISTS idx_exams_slug ON public.exams(slug);
CREATE INDEX IF NOT EXISTS idx_exams_category ON public.exams(category);
CREATE INDEX IF NOT EXISTS idx_exams_is_verified ON public.exams(is_verified);

-- exam_subscriptions
CREATE INDEX IF NOT EXISTS idx_exam_subscriptions_user_id ON public.exam_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_subscriptions_exam_id ON public.exam_subscriptions(exam_id);

-- jobs
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_college_id ON public.jobs(college_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);

-- job_applications
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);

-- placement_drives
CREATE INDEX IF NOT EXISTS idx_placement_drives_slug ON public.placement_drives(slug);
CREATE INDEX IF NOT EXISTS idx_placement_drives_college_id ON public.placement_drives(college_id);
CREATE INDEX IF NOT EXISTS idx_placement_drives_status ON public.placement_drives(status);
CREATE INDEX IF NOT EXISTS idx_placement_drives_created_by ON public.placement_drives(created_by);

-- placement_applications
CREATE INDEX IF NOT EXISTS idx_placement_applications_drive_id ON public.placement_applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_placement_applications_user_id ON public.placement_applications(user_id);

-- blogs
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);

-- blog_likes
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);

-- blog_comments
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON public.blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);

-- notifications (composite index for efficient queries)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON public.notifications(user_id, is_read, created_at DESC);

-- user_documents
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);

-- agents
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);

-- agent_logs
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON public.agent_logs(agent_id);

-- bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_entity ON public.bookmarks(entity_type, entity_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- colleges policies
-- --------------------------------------------------------------------------
CREATE POLICY "colleges_select_authenticated"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "colleges_insert_super_admin"
  ON public.colleges FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "colleges_update_super_admin"
  ON public.colleges FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'super_admin')
  WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "colleges_delete_super_admin"
  ON public.colleges FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'super_admin');

-- --------------------------------------------------------------------------
-- profiles policies
-- --------------------------------------------------------------------------
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

-- --------------------------------------------------------------------------
-- exams policies
-- --------------------------------------------------------------------------
CREATE POLICY "exams_select_all"
  ON public.exams FOR SELECT
  TO authenticated
  USING (
    is_verified = true
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "exams_insert_admin"
  ON public.exams FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "exams_update_admin"
  ON public.exams FOR UPDATE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "exams_delete_super_admin"
  ON public.exams FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'super_admin');

-- --------------------------------------------------------------------------
-- exam_subscriptions policies
-- --------------------------------------------------------------------------
CREATE POLICY "exam_subscriptions_select_own"
  ON public.exam_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "exam_subscriptions_insert_own"
  ON public.exam_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "exam_subscriptions_delete_own"
  ON public.exam_subscriptions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- jobs policies
-- --------------------------------------------------------------------------
CREATE POLICY "jobs_select_visible"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    (
      status = 'active'
      AND (
        college_id IS NULL
        OR college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
        OR public.get_user_role() IN ('admin', 'super_admin', 'ambassador')
      )
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "jobs_insert_authorized"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin', 'ambassador'));

CREATE POLICY "jobs_update_own_or_admin"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    posted_by = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    posted_by = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "jobs_delete_own_or_super_admin"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (
    posted_by = auth.uid()
    OR public.get_user_role() = 'super_admin'
  );

-- --------------------------------------------------------------------------
-- job_applications policies
-- --------------------------------------------------------------------------
CREATE POLICY "job_applications_select_relevant"
  ON public.job_applications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.posted_by = auth.uid()
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "job_applications_insert_own"
  ON public.job_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "job_applications_update_relevant"
  ON public.job_applications FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.posted_by = auth.uid()
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.posted_by = auth.uid()
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

-- --------------------------------------------------------------------------
-- placement_drives policies
-- --------------------------------------------------------------------------
CREATE POLICY "placement_drives_select_relevant"
  ON public.placement_drives FOR SELECT
  TO authenticated
  USING (
    college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
    OR created_by = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "placement_drives_insert_authorized"
  ON public.placement_drives FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.get_user_role() = 'ambassador'
      AND college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "placement_drives_update_authorized"
  ON public.placement_drives FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

-- --------------------------------------------------------------------------
-- placement_applications policies
-- --------------------------------------------------------------------------
CREATE POLICY "placement_applications_select_relevant"
  ON public.placement_applications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.placement_drives
      WHERE placement_drives.id = placement_applications.drive_id
      AND placement_drives.created_by = auth.uid()
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "placement_applications_insert_own"
  ON public.placement_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "placement_applications_update_relevant"
  ON public.placement_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.placement_drives
      WHERE placement_drives.id = placement_applications.drive_id
      AND placement_drives.created_by = auth.uid()
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.placement_drives
      WHERE placement_drives.id = placement_applications.drive_id
      AND placement_drives.created_by = auth.uid()
    )
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

-- --------------------------------------------------------------------------
-- blogs policies
-- --------------------------------------------------------------------------
CREATE POLICY "blogs_select_visible"
  ON public.blogs FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR author_id = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "blogs_insert_own"
  ON public.blogs FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "blogs_update_own_or_admin"
  ON public.blogs FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    author_id = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "blogs_delete_own_or_super_admin"
  ON public.blogs FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR public.get_user_role() = 'super_admin'
  );

-- --------------------------------------------------------------------------
-- blog_likes policies
-- --------------------------------------------------------------------------
CREATE POLICY "blog_likes_select_all"
  ON public.blog_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_likes_insert_own"
  ON public.blog_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "blog_likes_delete_own"
  ON public.blog_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- blog_comments policies
-- --------------------------------------------------------------------------
CREATE POLICY "blog_comments_select_all"
  ON public.blog_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_comments_insert_own"
  ON public.blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "blog_comments_update_own"
  ON public.blog_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "blog_comments_delete_own_or_admin"
  ON public.blog_comments FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_role() IN ('admin', 'super_admin')
  );

-- --------------------------------------------------------------------------
-- notifications policies
-- --------------------------------------------------------------------------
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_all"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- user_documents policies
-- --------------------------------------------------------------------------
CREATE POLICY "user_documents_select_own"
  ON public.user_documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_documents_insert_own"
  ON public.user_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_documents_update_own"
  ON public.user_documents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_documents_delete_own"
  ON public.user_documents FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- agents policies
-- --------------------------------------------------------------------------
CREATE POLICY "agents_select_admin"
  ON public.agents FOR SELECT
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "agents_insert_super_admin"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "agents_update_admin"
  ON public.agents FOR UPDATE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- --------------------------------------------------------------------------
-- agent_logs policies
-- --------------------------------------------------------------------------
CREATE POLICY "agent_logs_select_admin"
  ON public.agent_logs FOR SELECT
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

-- --------------------------------------------------------------------------
-- bookmarks policies
-- --------------------------------------------------------------------------
CREATE POLICY "bookmarks_select_own"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "bookmarks_insert_own"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookmarks_delete_own"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- handle_new_user: create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- update_blog_likes_count
CREATE OR REPLACE FUNCTION public.update_blog_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blogs SET likes_count = likes_count + 1 WHERE id = NEW.blog_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blogs SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.blog_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_blog_comments_count
CREATE OR REPLACE FUNCTION public.update_blog_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blogs SET comments_count = comments_count + 1 WHERE id = NEW.blog_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blogs SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.blog_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_job_applications_count
CREATE OR REPLACE FUNCTION public.update_job_applications_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_drive_applications_count
CREATE OR REPLACE FUNCTION public.update_drive_applications_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.placement_drives SET applications_count = applications_count + 1 WHERE id = NEW.drive_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.placement_drives SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = OLD.drive_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- New user signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_exams_updated_at ON public.exams;
CREATE TRIGGER set_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER set_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_placement_drives_updated_at ON public.placement_drives;
CREATE TRIGGER set_placement_drives_updated_at
  BEFORE UPDATE ON public.placement_drives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_placement_applications_updated_at ON public.placement_applications;
CREATE TRIGGER set_placement_applications_updated_at
  BEFORE UPDATE ON public.placement_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_blogs_updated_at ON public.blogs;
CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER set_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_user_documents_updated_at ON public.user_documents;
CREATE TRIGGER set_user_documents_updated_at
  BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_agents_updated_at ON public.agents;
CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_colleges_updated_at ON public.colleges;
CREATE TRIGGER set_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Count triggers
DROP TRIGGER IF EXISTS on_blog_like_change ON public.blog_likes;
CREATE TRIGGER on_blog_like_change
  AFTER INSERT OR DELETE ON public.blog_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_likes_count();

DROP TRIGGER IF EXISTS on_blog_comment_change ON public.blog_comments;
CREATE TRIGGER on_blog_comment_change
  AFTER INSERT OR DELETE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_comments_count();

DROP TRIGGER IF EXISTS on_job_application_change ON public.job_applications;
CREATE TRIGGER on_job_application_change
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_job_applications_count();

DROP TRIGGER IF EXISTS on_placement_application_change ON public.placement_applications;
CREATE TRIGGER on_placement_application_change
  AFTER INSERT OR DELETE ON public.placement_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_drive_applications_count();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets (idempotent using DO block)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('blog-images', 'blog-images', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('resumes', 'resumes', false)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('company-logos', 'company-logos', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('college-logos', 'college-logos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- avatars (public bucket) - anyone can view, authenticated users can upload/update own
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- documents (private bucket) - only own documents
CREATE POLICY "documents_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- blog-images (public bucket) - anyone can view, authenticated can upload
CREATE POLICY "blog_images_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "blog_images_update_authenticated"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images')
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "blog_images_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

-- resumes (private bucket) - only own resumes
CREATE POLICY "resumes_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "resumes_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "resumes_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "resumes_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- company-logos (public bucket) - anyone can view, admin/ambassador can upload
CREATE POLICY "company_logos_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');

CREATE POLICY "company_logos_insert_authorized"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.get_user_role() IN ('admin', 'super_admin', 'ambassador')
  );

CREATE POLICY "company_logos_update_authorized"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.get_user_role() IN ('admin', 'super_admin', 'ambassador')
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.get_user_role() IN ('admin', 'super_admin', 'ambassador')
  );

CREATE POLICY "company_logos_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

-- college-logos (public bucket) - anyone can view, super_admin can manage
CREATE POLICY "college_logos_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'college-logos');

CREATE POLICY "college_logos_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'college-logos'
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "college_logos_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'college-logos'
    AND public.get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    bucket_id = 'college-logos'
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "college_logos_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'college-logos'
    AND public.get_user_role() = 'super_admin'
  );
