# Implementation Plan: Hellen Ferreira Fotografia v2

## Phase 1: Environment & Project Setup
- [ ] Initialize Next.js 15+ project with TypeScript and App Router.
- [ ] Configure Tailwind CSS v4 and import design tokens from `code-style-guide.json`.
- [ ] Set up project folder structure (components, hooks, lib, services, types).
- [ ] Initialize Git repository and connect to Vercel.

## Phase 2: Supabase Integration & Database Archeology
- [ ] Create Supabase project and link it to the local environment.
- [ ] Implement database schema as defined in the Spec:
    - [ ] `services` table.
    - [ ] `bookings` table with payment status.
    - [ ] `blog_posts` table.
    - [ ] `availabilities` table.
- [ ] Set up Row Level Security (RLS) policies for admin access.
- [ ] Create Supabase Storage buckets for `portfolio` and `blog` images.

## Phase 3: Design System & Shared Components
- [ ] Implement global CSS variables based on `Pearl`, `Linen`, and `Sand` colors.
- [ ] Create core UI components:
    - [ ] `Button` (Primary Blush, Secondary Sand).
    - [ ] `Typography` (Cormorant Garamond for Headings, Lato for Body).
    - [ ] `Navbar` (Minimalist with dropdown).
    - [ ] `Footer` (Clean with social links).
    - [ ] `ImageGallery` (Masonry layout with loading transitions).

## Phase 4: Public Site Development
- [ ] **Home Page:** Hero section, Featured Services grid, and Blog preview.
- [ ] **Service Page (Dynamic):** Pull data from Supabase, render specialized gallery, and placeholders for the booking widget.
- [ ] **Blog Page:** List of posts with premium editorial layout.
- [ ] **Blog Post Page:** Detailed view with optimized image rendering.

## Phase 5: Booking System & Mercado Pago
- [ ] Build `BookingCalendar` component to fetch and display availability.
- [ ] Implement booking submission form (Client info).
- [ ] Integrate Mercado Pago Checkout Pro:
    - [ ] Create API route for generating preference IDs.
    - [ ] Set up Webhook handler to listen for `payment.created` and `payment.updated`.
- [ ] Implement automated email notifications (Resend) upon confirmation.

## Phase 6: Admin Dashboard
- [ ] Implement Login page using Supabase Auth.
- [ ] **Stats Dashboard:** Visual overview of bookings and revenue.
- [ ] **Services Manager:** CRUD for services and their cover photos.
- [ ] **Gallery Manager:** Drag-and-drop uploader to Supabase Storage.
- [ ] **Blog CMS:** Rich text editor (Markdown) for writing posts.

## Phase 7: Polish, SEO & Deployment
- [ ] Add smooth animations (Framer Motion) for "breathing" effect.
- [ ] Configure dynamic SEO metadata (OpenGraph tags).
- [ ] Perform Lighthouse audit (focus on LCP and Accessibility targets).
- [ ] Final deployment to Vercel and domain configuration on GoDaddy.
