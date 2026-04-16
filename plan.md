# JobExam Platform - Complete Build Plan

## Context
Building "JobExam" - a modern youth platform from scratch using Next.js (App Router) for SEO, Supabase for backend, Redis for caching/sessions, deployed on Vercel. The existing DocuCenter React+Vite app is reference only. Architecture must be scalable for future features (Notes, AI Artifacts, social features).

## Tech Stack
- **Framework**: Next.js 14 (App Router) - SSR/SSG for SEO
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Cache**: Redis (Upstash - serverless, Vercel-native)
- **State**: Zustand (client) + React Server Components (server)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **SEO**: Next.js Metadata API, sitemap.xml, robots.txt, JSON-LD structured data
- **Analytics**: Vercel Analytics (optional)
- **Rate Limiting**: Upstash Ratelimit
- **Email**: Resend (Vercel-friendly, for notifications)

## Project Structure
```
jobexam/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (SEO-optimized, SSR/SSG)
│   │   ├── page.tsx              # Landing page
│   │   ├── jobs/
│   │   │   ├── page.tsx          # Jobs listing (SSR with search params)
│   │   │   └── [slug]/page.tsx   # Job detail (SSG + ISR)
│   │   ├── exams/
│   │   │   ├── page.tsx          # Exams listing
│   │   │   └── [slug]/page.tsx   # Exam detail (SSG + ISR)
│   │   ├── blogs/
│   │   │   ├── page.tsx          # Blog feed
│   │   │   └── [slug]/page.tsx   # Blog detail (SSG + ISR)
│   │   └── layout.tsx            # Public layout (Navbar + Footer)
│   │
│   ├── (auth)/                   # Auth routes
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── auth/callback/route.ts  # OAuth callback
│   │
│   ├── (dashboard)/              # Protected routes (client-side, no SEO needed)
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── placement/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── blogs/
│   │   │   ├── new/page.tsx      # Blog editor
│   │   │   └── [slug]/edit/page.tsx
│   │   └── jobs/
│   │       └── [slug]/apply/page.tsx
│   │
│   ├── (admin)/                  # Admin routes
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   └── admin/
│   │       ├── page.tsx          # Admin dashboard
│   │       ├── users/page.tsx
│   │       ├── ambassadors/page.tsx
│   │       ├── colleges/page.tsx
│   │       ├── exams/page.tsx
│   │       ├── jobs/page.tsx
│   │       ├── agents/page.tsx
│   │       └── content/page.tsx
│   │
│   ├── (ambassador)/             # Ambassador routes
│   │   ├── layout.tsx
│   │   └── ambassador/
│   │       ├── page.tsx
│   │       ├── placements/
│   │       │   ├── page.tsx
│   │       │   └── new/page.tsx
│   │       └── jobs/
│   │           ├── page.tsx
│   │           └── new/page.tsx
│   │
│   ├── api/                      # API routes (Next.js Route Handlers)
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   ├── jobs/route.ts
│   │   ├── exams/route.ts
│   │   ├── blogs/route.ts
│   │   ├── notifications/route.ts
│   │   ├── upload/route.ts
│   │   ├── admin/
│   │   │   ├── users/route.ts
│   │   │   ├── ambassadors/route.ts
│   │   │   └── agents/route.ts
│   │   └── cron/                 # Vercel Cron Jobs
│   │       └── fetch-exams/route.ts
│   │
│   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── robots.ts                 # Robots.txt
│   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   ├── loading.tsx               # Global loading
│   ├── error.tsx                 # Global error boundary
│   └── not-found.tsx             # 404 page
│
├── components/
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── page-header.tsx
│   │   └── mobile-nav.tsx
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ...etc
│   │   └── empty-state.tsx
│   └── shared/                   # Shared domain components
│       ├── seo-head.tsx          # JSON-LD structured data
│       ├── share-buttons.tsx
│       └── pagination.tsx
│
├── features/                     # Feature modules (client components + hooks)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   ├── google-auth-button.tsx
│   │   │   └── auth-guard.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── jobs/
│   │   ├── components/
│   │   │   ├── job-card.tsx
│   │   │   ├── job-list.tsx
│   │   │   ├── job-filters.tsx
│   │   │   ├── job-detail.tsx
│   │   │   ├── job-application-form.tsx
│   │   │   ├── post-job-form.tsx
│   │   │   └── my-applications.tsx
│   │   ├── hooks/
│   │   │   └── use-jobs.ts
│   │   ├── actions.ts            # Server Actions for mutations
│   │   ├── store.ts
│   │   └── types.ts
│   ├── exams/
│   │   ├── components/
│   │   │   ├── exam-card.tsx
│   │   │   ├── exam-list.tsx
│   │   │   ├── exam-filters.tsx
│   │   │   ├── exam-detail.tsx
│   │   │   ├── exam-subscribe-button.tsx
│   │   │   └── exam-tracker.tsx
│   │   ├── hooks/
│   │   │   └── use-exams.ts
│   │   ├── actions.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── placement/
│   │   ├── components/
│   │   │   ├── drive-card.tsx
│   │   │   ├── drive-list.tsx
│   │   │   ├── drive-detail.tsx
│   │   │   ├── drive-application-form.tsx
│   │   │   ├── create-drive-form.tsx
│   │   │   └── placement-stats.tsx
│   │   ├── hooks/
│   │   │   └── use-placement.ts
│   │   ├── actions.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── blogs/
│   │   ├── components/
│   │   │   ├── blog-card.tsx
│   │   │   ├── blog-list.tsx
│   │   │   ├── blog-detail.tsx
│   │   │   ├── blog-editor.tsx
│   │   │   ├── blog-comments.tsx
│   │   │   ├── comment-item.tsx
│   │   │   ├── like-button.tsx
│   │   │   └── exam-tag-selector.tsx
│   │   ├── hooks/
│   │   │   └── use-blogs.ts
│   │   ├── actions.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── documents/
│   │   ├── components/
│   │   │   ├── document-card.tsx
│   │   │   ├── document-list.tsx
│   │   │   ├── document-uploader.tsx
│   │   │   ├── document-wallet.tsx
│   │   │   └── category-tabs.tsx
│   │   ├── hooks/
│   │   │   └── use-documents.ts
│   │   ├── actions.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── admin/
│   │   ├── components/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-stats.tsx
│   │   │   ├── user-management.tsx
│   │   │   ├── ambassador-management.tsx
│   │   │   ├── agent-management.tsx
│   │   │   ├── agent-log-viewer.tsx
│   │   │   ├── exam-approval-queue.tsx
│   │   │   ├── manual-exam-form.tsx
│   │   │   ├── college-management.tsx
│   │   │   └── content-moderation.tsx
│   │   ├── hooks/
│   │   │   └── use-admin.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── ambassador/
│   │   ├── components/
│   │   │   ├── ambassador-sidebar.tsx
│   │   │   └── college-stats.tsx
│   │   ├── hooks/
│   │   │   └── use-ambassador.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── notifications/
│   │   ├── components/
│   │   │   ├── notification-bell.tsx
│   │   │   ├── notification-dropdown.tsx
│   │   │   ├── notification-item.tsx
│   │   │   └── notification-list.tsx
│   │   ├── hooks/
│   │   │   └── use-notifications.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── profile/
│   │   ├── components/
│   │   │   ├── profile-form.tsx
│   │   │   ├── avatar-uploader.tsx
│   │   │   └── college-selector.tsx
│   │   ├── actions.ts
│   │   └── types.ts
│   └── dashboard/
│       ├── components/
│       │   ├── dashboard-stats.tsx
│       │   ├── quick-actions.tsx
│       │   ├── recent-activity.tsx
│       │   └── subscribed-blogs-feed.tsx
│       └── types.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (for RSC/Route Handlers)
│   │   ├── middleware.ts         # Auth middleware helper
│   │   └── types.ts              # Generated database types
│   ├── redis.ts                  # Upstash Redis client
│   ├── rate-limit.ts             # Upstash rate limiter
│   ├── types.ts                  # Shared app types
│   ├── constants.ts              # App constants, categories, roles
│   ├── utils.ts                  # cn() + helpers
│   ├── formatters.ts             # Date, file size formatters
│   └── slugify.ts                # URL-safe slug generation
│
├── hooks/
│   ├── use-mobile.ts
│   ├── use-debounce.ts
│   └── use-realtime.ts           # Supabase realtime hook
│
├── middleware.ts                  # Next.js middleware (auth + rate limiting)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local                    # Environment variables
└── vercel.json                   # Vercel config (cron jobs, redirects)
```

## Database Schema (Complete)

### Enums
- `user_role`: user, admin, super_admin, ambassador
- `job_type`: full_time, part_time, internship, contract, freelance
- `job_status`: draft, active, closed, expired
- `application_status`: pending, shortlisted, rejected, accepted, withdrawn
- `drive_status`: upcoming, ongoing, completed, cancelled
- `exam_status`: pending, approved, rejected
- `notification_type`: exam, job, placement, blog, document, system
- `agent_status`: active, paused, error, disabled
- `blog_status`: draft, published, archived

### Tables (16 tables)

1. **colleges** - id, name, code (unique), city, state, university, website_url, logo_url, student_count, timestamps
2. **profiles** - id, user_id (FK auth.users, unique), role (user_role), full_name, avatar_url, phone, email, college_id (FK), graduation_year, degree, branch, bio, resume_url, skills[], timestamps
3. **exams** - id, name, slug (unique), category, description, registration_start, registration_end, exam_date, result_date, answer_key_date, website_url, eligibility, application_fee, syllabus_url, is_verified, status (exam_status), source, agent_id (FK), created_by (FK), tags[], meta (jsonb), timestamps
4. **exam_subscriptions** - id, user_id (FK), exam_id (FK), notify_updates, UNIQUE(user_id, exam_id), created_at
5. **jobs** - id, title, slug (unique), company_name, company_logo_url, description, requirements, location, remote_allowed, job_type, salary_min, salary_max, salary_currency, experience_min, experience_max, skills_required[], eligibility, application_url, application_deadline, status (job_status), posted_by (FK), college_id (FK nullable - null=public), is_featured, views_count, applications_count, tags[], timestamps
6. **job_applications** - id, job_id (FK), user_id (FK), resume_url, cover_letter, status (application_status), notes, UNIQUE(job_id, user_id), timestamps
7. **placement_drives** - id, title, slug (unique), company_name, company_logo_url, description, college_id (FK, NOT NULL), drive_date, registration_deadline, eligibility, min_cgpa, package_offered, roles_offered[], process_rounds[], status (drive_status), created_by (FK), views_count, applications_count, timestamps
8. **placement_applications** - id, drive_id (FK), user_id (FK), resume_url, status (application_status), current_round, notes, UNIQUE(drive_id, user_id), timestamps
9. **blogs** - id, title, slug (unique), content (text/markdown), excerpt, cover_image_url, author_id (FK), status (blog_status), exam_tags (uuid[]), tags (text[]), is_featured, likes_count, comments_count, views_count, published_at, timestamps
10. **blog_likes** - id, blog_id (FK), user_id (FK), UNIQUE(blog_id, user_id), created_at
11. **blog_comments** - id, blog_id (FK), user_id (FK), parent_id (FK self, nullable), content, is_edited, timestamps
12. **notifications** - id, user_id (FK), type (notification_type), title, message, link, reference_id, is_read, created_at
13. **user_documents** - id, user_id (FK), file_name, file_type, file_size, storage_path, category, description, is_verified, timestamps
14. **agents** - id, name, description, source_type, source_config (jsonb), schedule (cron), status (agent_status), last_run_at, last_run_result, exams_found, created_by (FK), timestamps
15. **agent_logs** - id, agent_id (FK), status, exams_found, exams_added, error_message, details (jsonb), duration_ms, created_at
16. **bookmarks** - id, user_id (FK), entity_type (text: 'job'|'exam'|'blog'|'drive'), entity_id (uuid), UNIQUE(user_id, entity_type, entity_id), created_at

### Key RLS Policies
- **colleges**: readable by all, writable by super_admin only
- **profiles**: readable by all, users update own, admin/super_admin can update roles
- **exams**: readable by all (if verified), writable by admin/super_admin
- **jobs**: public jobs readable by all; college-specific jobs only by matching college users + admins; writable by admin/super_admin/ambassador
- **placement_drives**: readable only by same-college users + admins + creator; writable by ambassador (own college) + admin
- **blogs**: published readable by all, drafts by author only; writable by author, deletable by author + admin
- **notifications**: user sees own only
- **user_documents**: user sees own only
- **agents/agent_logs**: admin/super_admin only

### Database Functions & Triggers
1. `handle_new_user()` - trigger on auth.users insert, creates profile row
2. `update_blog_likes_count()` - trigger on blog_likes insert/delete
3. `update_blog_comments_count()` - trigger on blog_comments insert/delete
4. `update_job_applications_count()` - trigger on job_applications insert/delete
5. `update_drive_applications_count()` - trigger on placement_applications insert/delete
6. `update_updated_at()` - generic trigger for timestamps
7. `get_user_role()` - helper function for RLS policies

### Supabase Storage Buckets
1. **avatars** - public read, user writes own (2MB max, images only)
2. **documents** - private, user owns (10MB max)
3. **blog-images** - public read, auth write (5MB max, images only)
4. **resumes** - private, user owns + job poster can read (5MB max, PDF only)
5. **company-logos** - public read, admin/ambassador write (1MB max)
6. **college-logos** - public read, super_admin write (1MB max)

## Redis Usage (Upstash)
1. **Page cache**: Cache SSR pages for public routes (jobs, exams, blogs lists)
2. **Rate limiting**: API route rate limits per user/IP
3. **Session cache**: Cache user profile/role for fast middleware checks
4. **View counts**: Increment blog/job/drive views atomically
5. **Search cache**: Cache search results for common queries (5 min TTL)
6. **Notification counts**: Cache unread notification count per user

## SEO Strategy
1. **Static Generation (SSG + ISR)**: Exam detail, Blog detail, Job detail pages - revalidate every 1 hour
2. **Server-Side Rendering (SSR)**: List pages with search/filters
3. **Metadata API**: Dynamic title, description, og:image per page
4. **JSON-LD**: JobPosting schema for jobs, Article schema for blogs, Event schema for exams
5. **Sitemap**: Dynamic sitemap.ts generating URLs for all public content
6. **Robots.txt**: Allow all public routes, block dashboard/admin
7. **Canonical URLs**: Prevent duplicate content
8. **Open Graph + Twitter Cards**: Social sharing metadata

## Vercel-Specific Features
1. **Vercel Cron**: Schedule agent runs for exam fetching (`vercel.json` crons)
2. **Vercel Analytics**: Page views, web vitals
3. **Vercel KV (Upstash Redis)**: Built-in Redis integration
4. **Edge Middleware**: Auth checks + rate limiting at the edge
5. **ISR**: Incremental Static Regeneration for content pages
6. **Image Optimization**: next/image for all images

## Implementation Order

### Step 1: Project Setup
- Initialize Next.js 14 project with App Router in the existing directory
- Install dependencies: @supabase/supabase-js, @supabase/ssr, @upstash/redis, @upstash/ratelimit, zustand, tailwindcss, shadcn/ui, zod, date-fns, lucide-react, sonner, react-hook-form, @hookform/resolvers
- Configure tailwind.config.ts with black/white theme
- Set up .env.local template
- Configure next.config.js and vercel.json

### Step 2: Supabase + Redis Setup
- Write complete SQL migration (all 16 tables, enums, RLS, triggers, functions, indexes, storage)
- Set up Supabase clients (browser + server + middleware)
- Set up Upstash Redis client
- Set up rate limiter
- Generate TypeScript types
- Write lib/types.ts with all interfaces

### Step 3: Theme + Layout Shell
- Write index.css with black/white-only CSS variables
- Initialize shadcn/ui components
- Build Navbar, Footer, MainLayout, Sidebar, PageHeader
- Build root layout with providers (theme, toast, query)
- Build middleware.ts for auth

### Step 4: Auth
- Login page, Signup page (Google + email/password)
- OAuth callback handler
- Auth store + useAuth hook
- ProtectedRoute + RoleGuard in middleware
- Profile auto-creation via DB trigger

### Step 5: Landing Page + Dashboard
- SEO-optimized landing page with hero, features, stats
- Protected dashboard with stats, quick actions, recent activity

### Step 6: Exams Feature
- ExamsPage (SSR with filters)
- ExamDetailPage (SSG + ISR, JSON-LD)
- Subscription system
- ExamTracker dashboard widget
- Related blogs section on detail page

### Step 7: Jobs Feature
- JobsPage (SSR with filters)
- JobDetailPage (SSG + ISR, JSON-LD JobPosting)
- Application flow
- PostJobForm for ambassadors/admins
- MyApplications page

### Step 8: Placement Feature
- PlacementPage (filtered by college)
- DriveDetailPage
- Application flow
- CreateDriveForm for ambassadors

### Step 9: Blogs Feature
- BlogsPage (SSR with filters)
- BlogDetailPage (SSG + ISR, JSON-LD Article)
- Blog editor (markdown)
- Comments + Likes
- Exam tagging
- Subscribed exam blog feed on dashboard

### Step 10: Documents Feature
- DocumentsPage with upload, categories
- Supabase Storage integration
- DocumentWallet dashboard widget

### Step 11: Admin Panel
- Admin layout with sidebar
- Dashboard with stats
- User management (view, change roles)
- Ambassador management (create, assign college)
- College management (CRUD)
- Exam management (approval queue, manual add)
- Agent management + logs
- Job/Content moderation

### Step 12: Ambassador Panel
- Ambassador layout with sidebar
- College-specific dashboard
- Placement drive management
- Job posting for their college

### Step 13: Notifications
- Supabase Realtime subscription
- NotificationBell in navbar
- NotificationsPage
- DB triggers for notification creation

### Step 14: SEO + Performance
- Sitemap generation
- JSON-LD structured data on all public pages
- Open Graph images
- Redis caching for hot routes
- Image optimization

### Step 15: Polish
- Loading skeletons everywhere
- Error boundaries per route
- Empty states
- Responsive design audit
- Accessibility (a11y)
- Final Vercel deploy config

## Verification
- `npm run dev` after each step
- `npm run build` to verify no build errors
- Test auth: email signup, Google login, role-based redirects
- Test RLS: users can't access others' data
- Test ambassador: can only see/create for own college
- Test SEO: check page source for metadata, test with Lighthouse
- Test dark/light theme toggle
- Test mobile responsiveness
- Verify Vercel deployment preview