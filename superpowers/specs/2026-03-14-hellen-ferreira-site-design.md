# Design Spec: Hellen Ferreira Fotografia v2

## 1. Vision & Objective
Build a high-performance, premium photography website for Hellen Ferreira, migrating from Wix to a modern stack (Next.js, Supabase, Mercado Pago). The goal is to maximize conversions for newborn, maternity, and family photography through an integrated booking system while maintaining a "Fine-Art" aesthetic.

## 2. Technical Stack
- **Frontend:** Next.js 15+ (App Router), React, Tailwind CSS v4.
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Payments:** Mercado Pago SDK (Checkout Pro).
- **Deployment:** Vercel.
- **Email/Notifications:** Resend (initial phase) with hooks prepared for WhatsApp integration (future).

## 3. Design System (Ref: `code-style-guide.json`)
- **Theme:** "Light-first", minimalist, and warm.
- **Colors:** Primary: Pearl (#FCFBF9), Linen (#F5F2EC); Accent: Blush (#D4A39B).
- **Typography:** Headings: Cormorant Garamond (Serif); Body: Lato (Sans-serif).
- **Imagery:** Focus on natural light, connectors, and emotional legacy. Opaque/heavy overlays are forbidden.

## 4. Key Features & Pages

### 4.1 Public Pages
- **Home:** Hero section with emotional impact, service overview, and "Book Now" CTA.
- **Service Pages (`/servicos/[slug]`):**
  - Specialized masonry photo galleries.
  - Descriptive "Experience" text.
  - **Embedded Booking Widget:** Real-time calendar linked to Supabase availability.
- **Blog (`/blog`):**
  - Content focused on client education and SEO.
  - Minimalist layout for readability.

### 4.2 Booking Flow
1. User selects service and available date/time.
2. User submits basic details (Name, WhatsApp, Email).
3. Redirect to **Mercado Pago Checkout Pro**.
4. **Webhook Processing:** On success, Supabase updates booking status to "confirmed" and blocks the slot.
5. Automated email confirmation via Resend.

### 4.3 Admin Panel (`/admin`)
- **Authentication:** Supabase Auth (Admin only).
- **Dashboard:** Overview of pending and confirmed bookings.
- **Content Management:**
  - Gallery Manager: Upload/Delete images (Supabase Storage).
  - Blog Editor: Post creation with Markdown support.
  - Service Manager: Edit prices, descriptions, and cover photos.

## 5. Data Schema (Supabase)
- **`services`:** `id`, `name`, `slug`, `description`, `price`, `cover_image_url`.
- **`bookings`:** `id`, `service_id`, `customer_name`, `customer_email`, `customer_phone`, `date_time`, `status` (pending/confirmed), `payment_id`.
- **`blog_posts`:** `id`, `title`, `slug`, `content`, `published_at`, `status`.
- **`availabilities`:** `id`, `service_id`, `day_of_week`, `start_time`, `end_time` (or specific date exceptions).

## 6. Error Handling & Edge Cases
- **Payment Failure:** If Mercado Pago returns a rejected status, the booking remains "pending" for 1 hour before the slot is automatically released.
- **Double Booking:** A database constraint (or row-level locking) will prevent two users from booking the same slot simultaneously.
- **Image Upload:** Large files (>5MB) will be rejected in the admin panel with a message to compress them first for web performance.

## 7. Testing Strategy
- **Payment Sandbox:** Use Mercado Pago test credentials to simulate successful and failed transactions.
- **Mobile Responsiveness:** Manual testing on Chrome DevTools with various screen sizes (iPhone, Android).
- **SEO Validation:** Use Lighthouse to ensure LCP and Accessibility scores are above 90.

## 8. Performance & SEO
- **Images:** Next/Image optimization with WebP format.
- **Storage:** Supabase Storage (1GB free tier) for site assets; Google Drive for final client delivery.
- **SEO:** Dynamic metadata for service pages and blog posts. Fast LCP (Largest Contentful Paint) targets.

## 9. Future Roadmap
- WhatsApp automated reminders.
- Private Client Galleries (Auth-protected).
- Automated Invoice generation (Asaas or external integration).
