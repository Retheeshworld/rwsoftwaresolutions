## RW Software Solutions LMS — Phased Build

A full Udemy-style LMS (admin uploads videos, students watch & track progress, certificates, payments) is a multi-week project. To keep quality high and avoid a half-broken mega-build, I'll ship it in phases. **Phase 1 below is what I'll build now if you approve.** Phases 2–3 follow in later turns.

---

### Phase 1 — Foundation (this turn)

**Database (new tables, all with RLS)**
- `courses` — title, slug, description, price, thumbnail_url, duration, level, is_published, created_by
- `modules` — course_id, title, position
- `lessons` — module_id, title, description, video_url, video_duration_seconds, thumbnail_url, resource_url, position, is_published
- `enrollments` — user_id, course_id, enrolled_at, status
- `lesson_progress` — user_id, lesson_id, completed, completed_at, last_position_seconds
- `certificates` — user_id, course_id, certificate_id (e.g. RW-2026-00123), issued_at
- Storage buckets: `course-videos` (private), `course-thumbnails` (public), `course-resources` (private)
- RLS: admins manage everything; students read published courses, read/write their own enrollments, progress, and certificates; signed URLs for private video/resource access.
- Trigger: when a student marks all lessons of a course complete, auto-issue a certificate.

**Admin dashboard (`/admin`) — expanded**
- Overview tab: total students, total courses, total enrollments, revenue (sum of ₹999 × enrollments), recent enrollments.
- Courses tab: list / create / edit / delete / publish toggle.
- Course editor (`/admin/courses/$courseId`): edit course meta + manage modules and lessons (drag-free, position-numbered), upload video + thumbnail + PDF resource per lesson.
- Video upload: client-side validation (MP4/MOV/WEBM, ≤500 MB, ≤30 min via `<video>` metadata probe), upload to `course-videos` bucket with a real progress bar, auto-fill duration. Reject oversized / wrong format / >30 min files with clear errors.
- Internship applications tab stays.

**Student dashboard (`/dashboard`) — new**
- Welcome + stats (enrolled, in progress, completed, certificates earned).
- "Continue learning" card that deep-links to last incomplete lesson.
- "My Courses" grid with progress bars.
- Certificates list with download (renders certificate as printable HTML page at `/certificate/$certId`).

**Lesson player (`/learn/$courseId/$lessonId`)**
- Sidebar with module → lesson tree, completion checkmarks, locked if not enrolled.
- HTML5 `<video>` player streamed via signed URL.
- "Mark as complete" button, auto-advance to next lesson, prev/next nav.
- Lesson notes/description and "Download resources" (signed URL).
- Saves `last_position_seconds` periodically for resume.

**Enrollment flow**
- "Enroll now" on landing course cards → if logged out, send to `/signup?redirect=/courses`; if logged in, create enrollment row immediately (₹999 marked as `pending` payment, but access granted — payments stubbed in Phase 1).
- After enroll, redirect to `/learn/$courseId/<first-lesson>`.

**Auth**
- Existing email/password + Google + admin role stays as-is. Add `/dashboard` and `/learn/*` behind the existing auth context. Admin routes remain admin-only.

**Routing changes**
- New: `/dashboard`, `/learn/$courseId/$lessonId`, `/certificate/$certId`, `/admin/courses`, `/admin/courses/$courseId`.
- Existing `/courses` landing keeps its design; "Enroll Now" buttons wired to real DB courses (seeded with the 7 courses you listed at ₹999).

**Seed**
- Insert the 7 courses (AI Tools Mastery, Full Stack, Python, UI/UX Figma, Graphic Design, Digital Marketing, Freelancing) with placeholder modules so the structure is visible immediately. Real videos uploaded via admin.

---

### Phase 2 — Polish (next turn, after you confirm Phase 1)
- Real Stripe/Paddle checkout for ₹999 (Lovable built-in payments).
- Resumable / chunked video uploads for large files.
- HLS transcoding consideration (or stick with direct MP4 streaming).
- Email notifications on enroll / certificate.
- Forgot password + `/reset-password` page.
- FAQ + testimonials sections on landing.

### Phase 3 — Scale
- Video analytics, quizzes, drip content, coupon codes, instructor accounts.

---

### Things you should know
- **Hydration error on `/courses`** from the previous build will be fixed in this pass (whitespace inside `<li>` next to `<Mail />`).
- **Video storage costs**: Supabase storage charges for egress. For long-term scale, a dedicated video host (Mux, Cloudflare Stream, Bunny) is better — happy to swap in Phase 2 if you want.
- **30-min cap**: enforced client-side via the browser's video metadata. A determined user could bypass it; true enforcement requires server-side probing (Phase 2).
- **Payments**: Phase 1 grants access on enroll without real payment so you can demo end-to-end. We'll wire real ₹999 checkout in Phase 2.

---

**Reply "go" to ship Phase 1**, or tell me what to cut/add (e.g. "skip certificates for now", "do payments first", "use Mux for video").