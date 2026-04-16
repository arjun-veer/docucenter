# DocuCenter - Competitive Exam Hub

<div align="center">



**A comprehensive platform for students preparing for competitive exams in India**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Build & Deployment](#-build--deployment)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

DocuCenter (Competitive Exam Hub) is a modern web application designed to help Indian students streamline their competitive exam preparation journey. The platform provides essential tools to track exam dates, manage important documents, receive timely notifications, and stay organized throughout the preparation process.

### Why DocuCenter?

Preparing for competitive exams can be overwhelming with multiple exams, deadlines, and documents to manage. DocuCenter simplifies this process by providing:

- **Centralized exam tracking** - Never miss an important date
- **Secure document storage** - Keep all your certificates, ID proofs, and documents in one place
- **Smart notifications** - Get reminders for registration deadlines and exam dates
- **User-friendly interface** - Clean, intuitive design for easy navigation

---

## ✨ Features

### 🗓️ Exam Tracking
- Track all upcoming competitive exams (JEE, NEET, UPSC, SSC, Banking, etc.)
- View exam dates, registration deadlines, and result announcements
- Filter exams by category and search functionality
- Detailed exam information pages

### 📁 Document Wallet
- Securely store and organize important documents
- Upload and manage certificates, ID proofs, and other documents
- Easy document retrieval when needed
- Secure storage with Supabase backend

### 🔔 Notifications
- Receive timely updates about exam-related events
- Get reminders for registration deadlines
- Stay informed about result announcements
- Customizable notification preferences

### 👤 User Management
- Secure authentication with Supabase
- Personal profile management
- User-specific exam tracking
- Settings customization

### 📊 Admin Dashboard
- Admin panel for managing exam data
- User management capabilities
- Content moderation tools

### 🎨 Modern UI/UX
- Responsive design that works on all devices
- Dark mode support
- Smooth animations and transitions
- Accessible components with shadcn-ui

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Vite 5.4.1** - Fast build tool and dev server
- **React Router 6.26.2** - Client-side routing
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components

### Backend & Database
- **Supabase** - Backend as a Service (PostgreSQL database, authentication, storage)
- **@supabase/supabase-js** - Supabase client library

### State Management & Data Fetching
- **Zustand 4.4.7** - Lightweight state management
- **TanStack Query 5.56.2** - Powerful data fetching and caching

### UI Components & Libraries
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation
- **Sonner** - Toast notifications
- **date-fns** - Modern date utility library
- **Recharts** - Composable charting library

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download Git](https://git-scm.com/)

### Recommended
- **Visual Studio Code** - [Download VS Code](https://code.visualstudio.com/)
- **Supabase Account** - [Sign up for Supabase](https://supabase.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/arjun-veer/docucenter.git
cd docucenter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: Get your Supabase credentials from your [Supabase project dashboard](https://app.supabase.com/).

---

## 💻 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Other Development Commands

```bash
# Run ESLint to check code quality
npm run lint

# Preview production build locally
npm run preview
```

### Development Tips

- Hot Module Replacement (HMR) is enabled by default
- TypeScript errors will show in the terminal and browser
- Use React DevTools browser extension for debugging
- Check the browser console for any errors or warnings

---

## 🏗️ Build & Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Build for Development Environment

```bash
npm run build:dev
```

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

#### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard

#### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

#### Deploy via Lovable

This project was created with [Lovable](https://lovable.dev/). You can deploy directly through the Lovable platform:

1. Visit [Lovable Project](https://lovable.dev/projects/8e35ca97-18f7-4fa5-a362-f99b73433a70)
2. Click Share → Publish

---

## 📁 Project Structure

```
docucenter/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── og-image.png
│   └── placeholder.svg
├── src/
│   ├── components/        # React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── document/     # Document processing components
│   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   └── ui/          # Reusable UI components (shadcn-ui)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   ├── lib/              # Utilities and helpers
│   │   ├── stores/      # Zustand stores
│   │   ├── supabase.ts  # Supabase client
│   │   └── utils.ts     # Utility functions
│   ├── pages/            # Page components
│   │   ├── Index.tsx           # Landing page
│   │   ├── Auth.tsx            # Authentication page
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── Exams.tsx           # Exams listing
│   │   ├── ExamDetails.tsx     # Exam details page
│   │   ├── DocumentProcessor.tsx # Document management
│   │   ├── Profile.tsx         # User profile
│   │   ├── Settings.tsx        # App settings
│   │   ├── Notifications.tsx   # Notifications page
│   │   ├── AdminDashboard.tsx  # Admin panel
│   │   └── NotFound.tsx        # 404 page
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── supabase/             # Supabase configuration
├── .env                  # Environment variables (create this)
├── .gitignore
├── components.json       # shadcn-ui configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md            # This file
```

---

## ⚙️ Configuration

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com/)
2. Create the necessary tables:
   - `exams` - Store exam information
   - `documents` - Store user documents
   - `users` - User profiles
   - `notifications` - User notifications

3. Set up Row Level Security (RLS) policies
4. Configure storage buckets for document uploads
5. Add your Supabase URL and anon key to `.env`

### Tailwind CSS

Tailwind is configured in `tailwind.config.ts`. Customize:
- Colors and theme
- Fonts
- Breakpoints
- Plugins

### shadcn-ui Components

Components are configured in `components.json`. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting: `npm run lint`
5. Test your changes thoroughly
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style Guidelines

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic
- Keep components small and focused
- Use functional components with hooks

### Reporting Issues

Found a bug or have a suggestion? Please:

1. Check if the issue already exists
2. Create a new issue with a clear title and description
3. Include steps to reproduce (for bugs)
4. Add screenshots if applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev/)
- UI components from [shadcn-ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend powered by [Supabase](https://supabase.com/)

---

## 📞 Contact & Support

- **Project Repository**: [https://github.com/arjun-veer/docucenter](https://github.com/arjun-veer/docucenter)
- **Issues**: [GitHub Issues](https://github.com/arjun-veer/docucenter/issues)

---

<div align="center">

Made with ❤️ for Indian students preparing for competitive exams

**Star ⭐ this repository if you find it helpful!**

</div>
