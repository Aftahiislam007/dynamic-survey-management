# Dynamic Survey Management System - Frontend

A modern, responsive web application built with Next.js 14 for managing dynamic surveys. The frontend provides intuitive dashboards for both admin and officer roles, enabling survey creation, distribution, and response collection.

## Table of Contents
- [Project Setup Instructions](#project-setup-instructions)
- [Tech Stack](#tech-stack)
- [Design Decisions](#design-decisions)
- [Assumptions & Limitations](#assumptions--limitations)
- [Project Structure](#project-structure)

## Project Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- Backend API server running (see backend README)

### Installation Steps

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the frontend directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001

   # Optional: Analytics or third-party services
   # NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts
- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Docker Setup
A `Dockerfile.frontend` is included for containerized deployment:
```bash
docker build -f Dockerfile.frontend -t survey-frontend:latest .
docker run -p 3000:3000 survey-frontend:latest
```

## Tech Stack

### Core Framework & Runtime
- **Next.js** (v14.0.4) - React framework for production
  - App Router for file-based routing
  - Server-side rendering (SSR) & static generation
  - Built-in optimizations (image, code splitting)
- **React** (v18.2.0) - UI library
- **TypeScript** - Type-safe development

### State Management & Data Fetching
- **TanStack React Query** (v5.12.0) - Server state management
  - Query caching and synchronization
  - Automatic background refetching
  - Optimistic updates
- **Zustand** (v4.4.7) - Client state management
  - Lightweight alternative to Redux
  - Easy store creation

### Form Management & Validation
- **React Hook Form** (v7.47.0) - Performant form handling
  - Minimal re-renders
  - Cross-browser compatibility
- **Zod** (v3.22.4) - TypeScript-first schema validation
  - Runtime validation
  - Inferred TypeScript types from schemas
- **@hookform/resolvers** (v3.3.2) - Integration between hook-form and validation libraries

### HTTP Client & API
- **Axios** (v1.6.2) - HTTP client
  - Request/response interceptors
  - Automatic JWT token injection
  - Error handling and retry logic

### UI & Styling
- **Tailwind CSS** (v3.3.6) - Utility-first CSS framework
  - Responsive design utilities
  - Dark mode support
  - Component-based styling
- **Lucide React** (v0.309.0) - Icon collection
  - Consistent icon library
  - SVG-based icons
- **React Hot Toast** (v2.4.1) - Toast notifications
  - Non-blocking alerts
  - Customizable styling

### Date & Time
- **date-fns** (v2.30.0) - Date utility library
  - Lightweight alternative to Moment.js
  - Locale support
  - Functional approach

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Autoprefixer** - CSS vendor prefixes
- **PostCSS** - CSS processing

## Design Decisions

### 1. **Next.js App Router Architecture**
Leverages the modern App Router for:
- File-based routing with intuitive directory structure
- Layout composition for shared UI elements
- Automatic code splitting and performance optimization

**Rationale**: App Router provides superior developer experience and performance compared to Pages Router. Enables server components and better data fetching patterns.

### 2. **Role-Based Routing**
- Separate dashboards for `admin` and `officer` roles
- Protected routes via middleware authentication
- Route-level access control

Structure:
```
app/
├── (auth)/           # Public auth routes
├── admin/            # Admin dashboard
└── officer/          # Officer dashboard
```

**Rationale**: Clear separation ensures users see role-appropriate UI. Middleware provides security without scattered guards.

### 3. **React Query for Server State**
- Centralized server state management
- Automatic caching with configurable stale time
- Background synchronization of data
- Simplified loading/error states

Query configuration:
```typescript
staleTime: 60 * 1000        // 1 minute
gcTime: 5 * 60 * 1000       // 5 minutes
retry: 1                    // Single retry on failure
```

**Rationale**: React Query handles complex server synchronization logic. Reduces boilerplate compared to manual useFetch patterns.

### 4. **Zustand for Client State**
- Global store for authentication tokens, user info
- Simple store API without Redux complexity
- Per-store subscriptions for fine-grained updates

**Rationale**: Minimal library overhead. Clear separation between server state (React Query) and client state (Zustand).

### 5. **Tailwind CSS for Styling**
- Utility-first CSS approach
- No context switching between CSS and JSX
- Built-in responsive design and dark mode support
- Smaller bundle size than component libraries

**Rationale**: Tailwind enables rapid UI development with consistent design system. PostCSS integration for production optimization.

### 6. **Axios Interceptors for API**
Custom `ApiClient` class provides:
- Automatic JWT token injection
- Centralized error handling
- 401 redirect on auth failure
- Request/response transformation

**Rationale**: Eliminates repetitive auth logic across components. Single point of API configuration.

### 7. **React Hook Form for Forms**
- Low re-render approach (uncontrolled components by default)
- Integration with Zod for validation
- Auto-focus management
- Built-in form state tracking

**Rationale**: Minimizes unnecessary re-renders, improving performance with large forms. Zod provides type-safe validation.

### 8. **Middleware-Based Authentication**
```typescript
// src/middleware.ts
- Validates token presence
- Redirects unauthorized users
- Prevents auth navigation loops
```

**Rationale**: Edge-level routing keeps auth logic centralized and performant. Prevents flash of wrong content.

### 9. **Responsive Layout Components**
- Mobile-first design approach
- Tailwind breakpoints for adaptive UI
- Accessible navigation patterns

**Rationale**: Ensures usability across devices. CSS utilities make responsive design explicit in markup.

### 10. **Toast Notifications**
- Non-blocking feedback for user actions
- Global configuration for consistent styling
- Auto-dismiss with custom duration

**Rationale**: Non-modal notifications provide better UX than traditional alerts. Customizable appearance fits design system.

## Assumptions & Limitations

### Assumptions

1. **Backend API Availability**
   - Backend service running at `process.env.NEXT_PUBLIC_API_URL`
   - API returns responses in expected JSON format
   - CORS enabled for frontend origin

2. **Browser Capabilities**
   - Modern browser with ES2020+ support
   - LocalStorage available for token persistence
   - Cookies available for secure token storage

3. **Authentication Token Format**
   - JWT tokens passed in `Authorization: Bearer <token>` header
   - Token stored in both `localStorage` and `cookies`
   - Token contains user role information for role-based routing

4. **User Roles**
   - Only two roles: `admin` and `officer`
   - Role determines accessible dashboard
   - Additional permissions managed server-side

5. **Network Connectivity**
   - Persistent connection to backend
   - Graceful degradation not fully implemented

### Limitations

1. **Authentication & Security**
   - Token stored in `localStorage` (vulnerable to XSS)
   - No token refresh mechanism (relies on 24-hour expiration)
   - No refresh token rotation
   - No logout endpoint (client-side only)

2. **State Management**
   - Client state limited to Zustand stores
   - No state hydration from server (could lose state on refresh)
   - No offline-first capabilities

3. **API Integration**
   - No automatic request retries beyond React Query's basic retry
   - No request queuing or batching
   - No request deduplication

4. **Form Handling**
   - Limited custom validators
   - No form-level async validation
   - No field-level conditional rendering based on other fields

5. **UI/UX Constraints**
   - Tailwind utility classes can lead to verbose JSX
   - No component library (all custom components)
   - No accessibility audit (WCAG compliance not verified)
   - Limited mobile optimization for complex dashboards

6. **Performance**
   - No image optimization strategy
   - No lazy loading for routes
   - No service worker for offline support
   - No PWA capabilities

7. **Error Handling**
   - Generic error messages to users
   - No error boundaries
   - Limited error logging

8. **Data Caching**
   - Stale time set to 1 minute (may cause stale data display)
   - No cache invalidation triggers
   - Cache not persisted (lost on page refresh)

9. **Real-time Updates**
   - No WebSocket support
   - No server-sent events (SSE)
   - Polling required for live data updates

10. **Testing**
    - No test files included
    - No E2E test configuration
    - No unit test setup



## Project Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Authentication routes (public)
│   │   │   └── login/
│   │   ├── admin/             # Admin dashboard (protected)
│   │   │   ├── dashboard/
│   │   │   ├── surveys/
│   │   │   └── users/
│   │   ├── officer/           # Officer dashboard (protected)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/            # Reusable React components
│   │   ├── common/            # Shared UI components
│   │   ├── providers/         # Context/Provider components
│   │   │   └── ReactQueryProvider
│   │   ├── surveys/           # Survey-specific components
│   │   ├── submissions/       # Submission components
│   │   └── ui/                # Base UI components (buttons, inputs, etc.)
│   ├── lib/                   # Utility functions & configuration
│   │   ├── api/               # API client & endpoints
│   │   │   ├── client.ts      # Axios instance
│   │   │   ├── auth.ts        # Auth endpoints
│   │   │   ├── surveys.ts     # Survey endpoints
│   │   │   ├── fields.ts      # Field endpoints
│   │   │   └── submissions.ts # Submission endpoints
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand stores
│   │   └── utils/             # Helper functions
│   ├── styles/                # Global styles
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.ts            # API response types
│   │   ├── auth.ts           # Auth types
│   │   ├── survey.ts         # Survey types
│   │   ├── field.ts          # Field types
│   │   └── submission.ts     # Submission types
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static files
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.js          # PostCSS configuration
├── next.config.js             # Next.js configuration
├── .env.local                 # Environment variables (local)
├── package.json               # Dependencies
└── Dockerfile.frontend        # Docker image definition
```

## Key Features

### Admin Dashboard
- Survey management (create, edit, delete)
- User management (create, assign roles)
- View submission statistics
- Generate reports

### Officer Dashboard
- View assigned surveys
- Review submissions
- Export survey responses
- Manage survey workflow

### Survey Management
- Dynamic field creation (text, multiple choice, rating, etc.)
- Conditional field logic
- Survey publishing and distribution
- Response collection and analysis

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interfaces

