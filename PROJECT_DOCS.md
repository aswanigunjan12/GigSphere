# 📘 GigSphere — Complete Project Documentation

> **Version:** 1.0 | **Stack:** React 19 + Vite 8 + React Router 7 | **Storage:** localStorage (mock)  
> **Last Updated:** 2026-04-22

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Design System](#4-design-system)
5. [Routing & Navigation](#5-routing--navigation)
6. [Authentication & State](#6-authentication--state)
7. [Data Layer](#7-data-layer)
8. [Pages](#8-pages)
9. [Components](#9-components)
10. [Data Models](#10-data-models)
11. [Application Lifecycle](#11-application-lifecycle)
12. [Known Limitations & Future Work](#12-known-limitations--future-work)

---

## 1. Project Overview

**GigSphere** is a gig-connector platform prototype that bridges:
- **Students** → looking for flexible, short-term part-time jobs
- **Businesses** → looking for on-demand talent for specific gigs

It is a fully functional frontend SPA (Single Page Application) using mock data stored in `localStorage`. No backend or database is connected — everything runs in the browser.

### Core User Flows

| Actor | Actions |
|-------|---------|
| Student | Sign up → Browse gigs → Apply → Chat → Get paid → Leave review |
| Business | Sign up → Post gig → Review applicants → Accept/Reject → Mark complete → Pay → Leave review |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | ^19.2.5 |
| Build Tool | Vite | ^8.0.9 |
| Routing | React Router DOM | ^7.14.2 |
| Styling | Vanilla CSS (custom design system) | — |
| Typography | Google Fonts — Outfit | 300–800 |
| State | React Context API + useState | — |
| Persistence | Browser localStorage | — |
| Linting | ESLint + react-hooks + react-refresh | ^9.x |

---

## 3. Folder Structure

```
gigsphere/
├── public/
│   ├── favicon.svg          # App favicon
│   ├── hero-robot.png       # Hero section illustration
│   ├── icons.svg            # SVG icon set
│   ├── logo.png / logo.jpg  # GigSphere brand logo
├── src/
│   ├── assets/              # Internal assets (react.svg, vite.svg, hero.png)
│   ├── components/          # Reusable UI components
│   │   ├── GigCard.jsx / .css
│   │   ├── Navbar.jsx / .css
│   │   ├── ProtectedRoute.jsx
│   │   ├── StarRating.jsx / .css
│   │   └── TagInput.jsx / .css
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state (login, signup, logout, updateUser)
│   ├── data/
│   │   └── mockData.js      # Seed data for all collections
│   ├── pages/               # One file per route
│   │   ├── HomePage.jsx / .css
│   │   ├── LoginPage.jsx / AuthPages.css
│   │   ├── SignUpPage.jsx
│   │   ├── StudentDashboard.jsx / Dashboard.css
│   │   ├── BusinessDashboard.jsx
│   │   ├── BrowseGigsPage.jsx / BrowseGigs.css
│   │   ├── GigDetailPage.jsx / GigDetail.css
│   │   ├── PostGigPage.jsx / PostGig.css
│   │   ├── ChatPage.jsx / .css
│   │   ├── PaymentsPage.jsx / .css
│   │   ├── ReviewsPage.jsx / .css
│   │   └── ProfilePage.jsx / .css
│   ├── utils/
│   │   └── storage.js       # localStorage CRUD helpers
│   ├── App.jsx              # Route definitions + BrowserRouter
│   ├── main.jsx             # ReactDOM entry point
│   └── index.css            # Global design system
├── index.html               # HTML shell + Google Fonts
├── vite.config.js
├── package.json
└── eslint.config.js
```

---

## 4. Design System

Defined in `src/index.css` as CSS custom properties. **Light theme only.**

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#f5f0e6` | Page background |
| `--bg-secondary` | `#faf7f0` | Subtle section backgrounds |
| `--bg-card` | `#ffffff` | Cards and modals |
| `--teal` | `#2a9d8f` | Primary brand color, buttons, links |
| `--teal-dark` | `#1f7a6f` | Hover states |
| `--gold` | `#c9a84c` | CTA/action buttons |
| `--gold-dark` | `#b08d3a` | Gold hover |
| `--brick` | `#c0392b` | Danger/destructive |
| `--text-dark` | `#2c2c2c` | Headings |
| `--text-body` | `#444444` | Body text |
| `--text-muted` | `#6b6b6b` | Captions, labels |

### Typography

- **Font:** `Outfit` (Google Fonts), weights 300–800
- Scale: `--text-xs` (0.75rem) → `--text-4xl` (2.25rem)

### Global Utility Classes

| Class | Description |
|-------|-------------|
| `.container` | Max-width 1200px, centered, horizontal padding |
| `.card` | White card with border, radius, shadow, hover lift |
| `.btn` | Base button — pill shape, flex, 600 weight |
| `.btn-primary` | Teal filled button |
| `.btn-gold` | Gold filled CTA button |
| `.btn-outline` | Teal outline button |
| `.btn-outline-white` | Border-only button (light) |
| `.btn-sm` / `.btn-lg` | Size variants |
| `.form-group` | Label + input stacked layout |
| `.form-input` | Input/textarea/select styling with teal focus ring |
| `.badge` | Pill status label |
| `.badge-pending` | Yellow — pending state |
| `.badge-accepted` | Green — accepted/open state |
| `.badge-rejected` | Red — rejected state |
| `.badge-completed` | Teal — completed state |
| `.skill-tag` | Teal pill for skill chips |
| `.animate-fade-in-up` | Entrance animation (fadeInUp 0.6s) |
| `.animate-fade-in` | Fade-only entrance (0.4s) |
| `.empty-state` | Centered placeholder content |

### Animations (keyframes)

| Name | Effect |
|------|--------|
| `fadeInUp` | opacity 0→1 + translateY 20px→0 |
| `fadeIn` | opacity 0→1 |
| `float` | Gentle vertical bob (0 → -10px → 0) |

---

## 5. Routing & Navigation

Defined in `src/App.jsx` using React Router v7.

```
/                   → HomePage           (public)
/login              → LoginPage          (public)
/signup             → SignUpPage         (public)
/dashboard          → DashboardRouter    (protected)
                      ├── StudentDashboard  (if role=student)
                      └── BusinessDashboard (if role=business)
/gigs               → BrowseGigsPage    (protected)
/gigs/:id           → GigDetailPage     (protected)
/post-gig           → PostGigPage       (protected, business only)
/chat/:applicationId→ ChatPage          (protected)
/payments           → PaymentsPage      (protected)
/reviews/:gigId     → ReviewsPage       (protected)
/profile            → ProfilePage       (protected)
*                   → redirect to /
```

### DashboardRouter

A smart component that reads `user.role` and renders either `<StudentDashboard>` or `<BusinessDashboard>` — no separate routes needed.

### ProtectedRoute

`src/components/ProtectedRoute.jsx` — wraps any route that requires auth:
- Shows a loading spinner while `AuthContext` initializes
- Redirects to `/login` if no user session
- Accepts optional `allowedRole` prop — redirects to `/dashboard` if role doesn't match (used on `/post-gig` for `business` only)

---

## 6. Authentication & State

### AuthContext (`src/context/AuthContext.jsx`)

Global auth state provided via React Context. Wraps the entire app in `App.jsx`.

**State:**
- `user` — current logged-in user object (or `null`)
- `loading` — true while restoring session from localStorage on mount

**Methods exposed:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `login` | `(email, password) → {success, user?, error?}` | Finds user in localStorage, sets session |
| `signup` | `(userData) → {success, error?}` | Creates new user, saves to localStorage |
| `logout` | `() → void` | Clears user state and session key |
| `updateUser` | `(updatedData) → void` | Merges partial update into current user, persists both session and users array |

**Session persistence:** Uses `gs_session` localStorage key. On app boot, `initData()` seeds all mock collections if they don't exist yet, then `getSession()` restores the logged-in user.

---

## 7. Data Layer

### Storage Utility (`src/utils/storage.js`)

All data lives in `localStorage` under namespaced keys:

| Key constant | localStorage key | Collection |
|---|---|---|
| `users` | `gs_users` | All user accounts |
| `gigs` | `gs_gigs` | All gig listings |
| `applications` | `gs_applications` | Gig applications |
| `messages` | `gs_messages` | Chat messages |
| `payments` | `gs_payments` | Payment records |
| `reviews` | `gs_reviews` | Review entries |
| `session` | `gs_session` | Current logged-in user |

**Functions:**

| Function | Purpose |
|----------|---------|
| `initData()` | Seeds all collections from `mockData.js` if not already set |
| `getData(key)` | Reads + JSON.parses a collection; returns `[]` if missing |
| `setData(key, value)` | JSON.stringifies and writes a collection |
| `getSession()` | Returns parsed session user or `null` |
| `setSession(user)` | Persists user to session key |
| `clearSession()` | Removes session key |

### Mock Data (`src/data/mockData.js`)

Seed data used to initialize the app on first load:

- **3 students:** Alex Rivera (React/JS), Priya Verma (Python/Excel), Ankit Singh (Photography)
- **2 businesses:** TechStart Inc. (Technology, Bhopal), EventPro Solutions (Events, Indore)
- **5 gigs:** Shop Helper, Event Assistant, Food Delivery, React Frontend Dev, Social Media Manager
- **4 applications:** across various statuses (accepted, completed, pending, rejected)
- **4 messages:** in 2 conversation threads
- **1 payment:** completed (₹800, EventPro → Ankit)
- **2 reviews:** bi-directional for the Social Media Manager gig

---

## 8. Pages

### 8.1 HomePage (`/`)

**File:** `src/pages/HomePage.jsx` + `HomePage.css`

**Sections:**
1. **Hero** — animated background polygons + wave, "Work. Connect. Earn." headline, hero-robot.png illustration, Find Gigs + Post a Job CTAs
2. **Search Bar** — decorative search input linking to `/gigs` or `/login`
3. **Featured Gigs** — first 3 open gigs from localStorage, rendered as cards
4. **Browse by Category** — 4 category pods (Creative, Tech, Skilled Trades, Admin)
5. **Testimonials** — 3 hardcoded testimonial cards
6. **How It Works** — 4-step visual flow (Sign Up → Find/Post → Connect → Get Paid)
7. **CTA Banner** — Sign Up Free + Log In
8. **Footer** — Logo, nav links, copyright

**Auth-aware:** CTAs link to `/gigs`/`/post-gig` for logged-in users, `/signup`/`/login` for guests.

---

### 8.2 LoginPage (`/login`)

**File:** `src/pages/LoginPage.jsx` + `AuthPages.css`

- Email + password form
- Calls `AuthContext.login()`, navigates to `/dashboard` on success
- **Quick Demo Login buttons:** One-click login as Alex (student) or TechStart (business)
- Error display on invalid credentials
- Link to `/signup`

---

### 8.3 SignUpPage (`/signup`)

**File:** `src/pages/SignUpPage.jsx` + `AuthPages.css`

- **Role toggle:** Student / Business (changes form fields dynamically)
- **Student fields:** Name, Email, Password, Skills (TagInput), Availability (select)
- **Business fields:** Name, Email, Password, Industry (select)
- **Common field:** Location
- Validates required fields + min password length (6 chars)
- On success: shows confirmation, redirects to `/login` after 1.5s

---

### 8.4 Student Dashboard (`/dashboard` when role=student)

**File:** `src/pages/StudentDashboard.jsx` + `Dashboard.css`

**Stats bar:** Applications count | Accepted count | Total Earned (₹) | Rating

**My Applications panel:**
- Lists all applications where `studentId === user.id`
- Per application: gig title, pay, location, status badge
- If accepted → **Chat** button → `/chat/:applicationId`
- If completed + paid → **Review** button → `/reviews/:gigId`

**Recommended Gigs panel:**
- First 3 open gigs from storage
- Clickable cards linking to `/gigs/:id`

---

### 8.5 Business Dashboard (`/dashboard` when role=business)

**File:** `src/pages/BusinessDashboard.jsx` + `Dashboard.css`

**Stats bar:** Posted Gigs | Active | Applicants | Rating

**My Posted Gigs:**
- Shows all gigs where `businessId === user.id`
- Per gig: title, pay, location, status badge
- Per applicant under each gig:
  - Student name, avatar, skills
  - **Pending** → Accept / Reject buttons
  - **Accepted** → Chat + Mark Complete buttons
  - **Completed** → Pay button (→ `/payments`) + Review button (if paid)

**State mutations (all persisted to localStorage):**
- `handleAccept(appId)` → sets application `status='accepted'`, gig `status='in-progress'`
- `handleReject(appId)` → sets application `status='rejected'`
- `handleMarkComplete(appId)` → sets application `status='completed'`, creates a `payments` record with `status='pending'`, sets gig `status='completed'`

---

### 8.6 BrowseGigsPage (`/gigs`)

**File:** `src/pages/BrowseGigsPage.jsx` + `BrowseGigs.css`

- Loads all gigs from storage, filters to `status='open'`
- **Search bar:** filters by title, location, skills (case-insensitive)
- **Category filter pills:** All / Creative / Tech / Skilled / Admin
- Results count display
- Grid of `<GigCard>` components with `showApply=true` for students
- `handleApply(gigId)` pushes a new application to storage with `status='pending'`
- Already-applied gigs show "Applied" badge instead of Apply button

---

### 8.7 GigDetailPage (`/gigs/:id`)

**File:** `src/pages/GigDetailPage.jsx` + `GigDetail.css`

**Main column:**
- Gig title, urgent badge, pay/location/duration/status metadata
- Full description
- Skills required (as skill tags)
- Posted By — business avatar, name, industry, location

**Sidebar (student view):**
- **Not applied:** "Apply Now" button → reveals cover letter textarea → Submit Application
- **Applied:** confirmation state with dashboard link

**Sidebar (business view):** "You're viewing as a business" message + dashboard link

---

### 8.8 PostGigPage (`/post-gig`, business only)

**File:** `src/pages/PostGigPage.jsx` + `PostGig.css`

Form fields:
- Gig Title (required)
- Description (required, textarea)
- Skills Required (TagInput component)
- Pay (required, free text e.g. "₹500/day")
- Duration (e.g. "1 week")
- Location
- Category (select: Creative / Tech / Skilled Trades / Admin)

On submit: pushes new gig to localStorage with `status='open'`, `urgent=false`, timestamp.  
Success screen → redirects to `/dashboard` after 2s.

---

### 8.9 ChatPage (`/chat/:applicationId`)

**File:** `src/pages/ChatPage.jsx` + `ChatPage.css`

- Guards: redirects to `/dashboard` if application is not `status='accepted'`
- Resolves the other party (student sees business, business sees student)
- Loads messages filtered by `applicationId`
- Auto-scrolls to bottom on new messages (`useRef` + `scrollIntoView`)
- **Send form:** creates message object with `senderId=user.id`, persists to storage, updates local state
- Messages styled as chat bubbles — `.mine` (right) vs `.theirs` (left)
- Timestamps formatted as HH:MM

---

### 8.10 PaymentsPage (`/payments`)

**File:** `src/pages/PaymentsPage.jsx` + `PaymentsPage.css`

- Loads all payments where `fromId === user.id` OR `toId === user.id`

**Stats bar:** Total Earned/Paid | Pending Amount | Transaction Count

**Payment list:**
- Per payment: Gig title, other party name, amount, status badge
- **Business + pending** → "Pay Now" button → sets `status='completed'`, records `paidAt`

**Role-aware labels:**
- Student: "Total Earned", "From: [business]"
- Business: "Total Paid", "To: [student]"

---

### 8.11 ReviewsPage (`/reviews/:gigId`)

**File:** `src/pages/ReviewsPage.jsx` + `ReviewsPage.css`

- Loads all reviews for the gig
- Shows aggregate average rating + count

**Review form (conditional):**
- Visible only if: payment is completed for user's application on this gig AND user hasn't already reviewed
- `<StarRating>` interactive picker (1–5)
- Comment textarea
- Determines `revieweeId`: student → reviews business, business → reviews student

**Review list:** All reviews with reviewer avatar, name, star rating, comment, date

---

### 8.12 ProfilePage (`/profile`)

**File:** `src/pages/ProfilePage.jsx` + `ProfilePage.css`

**Profile card (left):** Avatar emoji, name, role badge, star rating, location

**Profile details (right):**
- View mode: Email, Location + role-specific fields
  - Student: Skills (tag chips), Availability
  - Business: Industry
- Edit mode: Inline form with same fields (email is read-only)
- Save → calls `updateUser()` from AuthContext, persists to storage

---

## 9. Components

### 9.1 Navbar (`src/components/Navbar.jsx`)

Persistent top navigation bar across all pages.

**Guest links:** Home | For Talent | For Business | Log In | Sign Up  
**Logged-in links:** Dashboard | Browse Gigs | [Post a Gig — business only] | Payments | Profile | user avatar+name | Logout

- Responsive hamburger menu for mobile (`menuOpen` state, `.hamburger-line` + `.active` CSS)
- Active link highlighting via `useLocation()`
- Logout clears session and navigates to `/`

---

### 9.2 GigCard (`src/components/GigCard.jsx`)

Reusable gig listing card used on BrowseGigsPage and StudentDashboard.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gig` | object | required | Gig data object |
| `showApply` | boolean | `false` | Show Apply/Applied button |
| `onApply` | function | — | Callback with `gigId` |
| `applied` | boolean | `false` | If true, shows "Applied" badge |

**Displays:** Category icon, Urgent badge, Time ago, Title (link to detail), truncated description, skill tags, pay, location, Apply/View button.

`timeAgo()` helper: converts ISO timestamp to "X hours ago" / "X days ago" / "Just now".

---

### 9.3 StarRating (`src/components/StarRating.jsx`)

Interactive or readonly 5-star rating widget.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rating` | number | `0` | Current rating value |
| `onChange` | function | — | Called with star value on click |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Controls star size via CSS class |
| `readonly` | boolean | `false` | Disables click/hover interaction |

Hover state tracked in local `useState`. Filled stars rendered with CSS class `.filled`.

---

### 9.4 TagInput (`src/components/TagInput.jsx`)

Chip/tag multi-input for skills.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `tags` | string[] | Current tag array |
| `onChange` | function | Called with new array |
| `placeholder` | string | Input placeholder |

**Keyboard interactions:**
- `Enter` or `,` → adds tag (if not duplicate)
- `Backspace` on empty input → removes last tag
- Click `×` on chip → removes that tag

Used in: SignUpPage (student skills), PostGigPage (required skills), ProfilePage (edit skills).

---

### 9.5 ProtectedRoute (`src/components/ProtectedRoute.jsx`)

Route guard wrapper component.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `children` | ReactNode | Content to render if authorized |
| `allowedRole` | `'student'` \| `'business'` | Optional role restriction |

Behavior:
1. Shows loading div while `loading === true`
2. Redirects to `/login` if no user
3. Redirects to `/dashboard` if `allowedRole` is set and doesn't match

---

## 10. Data Models

### User object

```js
{
  id: string,           // 's1', 'b1', 'u' + Date.now()
  role: 'student' | 'business',
  name: string,
  email: string,
  password: string,     // plaintext in mock (hash in production)
  avatar: string,       // emoji string
  location: string,
  rating: number,       // 0.0–5.0
  // Student only:
  skills: string[],
  availability: string,
  // Business only:
  industry: string,
}
```

### Gig object

```js
{
  id: string,
  businessId: string,
  title: string,
  description: string,
  skills: string[],
  pay: string,          // e.g. "₹500/day"
  duration: string,     // e.g. "1 week"
  location: string,
  category: 'skilled' | 'admin' | 'tech' | 'creative',
  status: 'open' | 'in-progress' | 'completed',
  urgent: boolean,
  postedAt: ISO string,
}
```

### Application object

```js
{
  id: string,
  gigId: string,
  studentId: string,
  businessId: string,
  status: 'pending' | 'accepted' | 'rejected' | 'completed',
  appliedAt: ISO string,
  coverLetter: string,
}
```

### Message object

```js
{
  id: string,
  applicationId: string,
  senderId: string,
  text: string,
  timestamp: ISO string,
}
```

### Payment object

```js
{
  id: string,
  applicationId: string,
  gigId: string,
  fromId: string,       // business
  toId: string,         // student
  amount: number,       // parsed from gig.pay
  status: 'pending' | 'completed',
  paidAt: ISO string | null,
}
```

### Review object

```js
{
  id: string,
  gigId: string,
  reviewerId: string,
  revieweeId: string,
  rating: number,       // 1–5
  comment: string,
  createdAt: ISO string,
}
```

---

## 11. Application Lifecycle

```
[Business] Post Gig
      ↓
  gig.status = 'open'
      ↓
[Student] Apply (BrowseGigs or GigDetail)
      ↓
  application.status = 'pending'
      ↓
[Business] Accept or Reject (BusinessDashboard)
      ↓
  REJECT → application.status = 'rejected'   (end)
  ACCEPT → application.status = 'accepted'
           gig.status = 'in-progress'
      ↓
[Both] Chat unlocked → /chat/:applicationId
      ↓
[Business] Mark Complete (BusinessDashboard)
      ↓
  application.status = 'completed'
  gig.status = 'completed'
  payment created { status: 'pending' }
      ↓
[Business] Pay Now (PaymentsPage)
      ↓
  payment.status = 'completed'
  payment.paidAt = now
      ↓
[Both] Review unlocked → /reviews/:gigId
  (requires payment.status === 'completed')
```

### Pay Amount Parsing

When `handleMarkComplete` runs in BusinessDashboard, the payment `amount` is extracted from `gig.pay` by stripping all non-digit characters:
```js
parseInt(gig?.pay?.replace(/[^\d]/g, '') || '0')
```
This means `"₹500/day"` → `500`, `"₹1500/day"` → `1500`.

---

## 12. Known Limitations & Future Work

### Current Limitations

| Issue | Detail |
|-------|--------|
| **No real backend** | All data in localStorage — clears on browser data reset |
| **Plaintext passwords** | Passwords stored as-is in mock data — never do in production |
| **No real-time chat** | Chat messages require manual page refresh to see other side |
| **Pay parsing is fragile** | Regex on pay string — breaks if format changes |
| **No email uniqueness on signup** | Checked only against current localStorage users |
| **No pagination** | All gigs/applications/messages loaded at once |
| **No image uploads** | Avatar is emoji only |
| **Single cover letter** | BrowseGigs apply uses "I am interested in this gig!" hardcoded string |

### Recommended Next Steps

1. **Backend:** Integrate Supabase (PostgreSQL + Auth + Realtime) or Firebase
2. **Real-time chat:** Use Supabase Realtime or Socket.IO for live messaging
3. **Password hashing:** bcrypt/argon2 on signup, JWT tokens for sessions
4. **File uploads:** Resume/portfolio attachments on applications
5. **Notifications:** In-app alerts for application status changes
6. **Search improvements:** Full-text search, location radius filter, pay range filter
7. **Skill matching:** Auto-recommend gigs based on student's skill array
8. **Payment gateway:** Integrate Razorpay or Stripe for real transactions
9. **Admin panel:** Platform-level moderation of gigs and users
10. **Mobile app:** React Native wrapper or PWA manifest

---

## Demo Credentials

| Role | Email | Password |
|------|-------|---------|
| Student (Alex Rivera) | `alex@example.com` | `password123` |
| Student (Priya Verma) | `priya@example.com` | `password123` |
| Student (Ankit Singh) | `ankit@example.com` | `password123` |
| Business (TechStart Inc.) | `techstart@example.com` | `password123` |
| Business (EventPro Solutions) | `eventpro@example.com` | `password123` |

> Use the **Quick Demo Login** buttons on the Login page for one-click access.

---

*Generated by reviewing the complete GigSphere codebase — all 30+ source files including pages, components, context, utils, data, and styles.*
