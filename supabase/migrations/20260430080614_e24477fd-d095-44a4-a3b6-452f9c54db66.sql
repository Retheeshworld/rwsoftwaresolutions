-- ============ LMS CORE TABLES ============

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  thumbnail_url text,
  price integer not null default 999,
  duration text,
  level text not null default 'Beginner',
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index modules_course_id_idx on public.modules(course_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_path text,
  video_duration_seconds integer,
  thumbnail_path text,
  resource_path text,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lessons_module_id_idx on public.lessons(module_id);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active',
  payment_status text not null default 'pending',
  amount_paid integer not null default 0,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrollments_user_idx on public.enrollments(user_id);
create index enrollments_course_idx on public.enrollments(course_id);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  last_position_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_progress_user_idx on public.lesson_progress(user_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index certificates_user_idx on public.certificates(user_id);

-- updated_at triggers
create trigger trg_courses_updated before update on public.courses
  for each row execute function public.update_updated_at_column();
create trigger trg_modules_updated before update on public.modules
  for each row execute function public.update_updated_at_column();
create trigger trg_lessons_updated before update on public.lessons
  for each row execute function public.update_updated_at_column();
create trigger trg_progress_updated before update on public.lesson_progress
  for each row execute function public.update_updated_at_column();

-- Auto-issue certificate when all lessons completed
create or replace function public.maybe_issue_certificate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  v_total int;
  v_done int;
  v_code text;
begin
  if new.completed = false then
    return new;
  end if;

  select m.course_id into v_course_id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where l.id = new.lesson_id;

  if v_course_id is null then
    return new;
  end if;

  select count(*) into v_total
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where m.course_id = v_course_id and l.is_published = true;

  select count(*) into v_done
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  join public.modules m on m.id = l.module_id
  where m.course_id = v_course_id
    and lp.user_id = new.user_id
    and lp.completed = true
    and l.is_published = true;

  if v_total > 0 and v_done >= v_total then
    v_code := 'RW-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random()*99999))::int::text, 5, '0');
    insert into public.certificates (user_id, course_id, certificate_code)
    values (new.user_id, v_course_id, v_code)
    on conflict (user_id, course_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_lesson_progress_certificate
after insert or update on public.lesson_progress
for each row execute function public.maybe_issue_certificate();

-- ============ RLS ============
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;

-- COURSES
create policy "Anyone can view published courses"
  on public.courses for select
  using (is_published = true or has_role(auth.uid(), 'admin'));
create policy "Admins manage courses"
  on public.courses for all
  to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- MODULES
create policy "View modules of viewable courses"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = modules.course_id
        and (c.is_published = true or has_role(auth.uid(), 'admin'))
    )
  );
create policy "Admins manage modules"
  on public.modules for all
  to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- LESSONS
create policy "View lessons of viewable courses"
  on public.lessons for select
  using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
        and (c.is_published = true or has_role(auth.uid(), 'admin'))
    )
  );
create policy "Admins manage lessons"
  on public.lessons for all
  to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- ENROLLMENTS
create policy "Users view own enrollments"
  on public.enrollments for select
  to authenticated
  using (auth.uid() = user_id or has_role(auth.uid(), 'admin'));
create policy "Users create own enrollments"
  on public.enrollments for insert
  to authenticated
  with check (auth.uid() = user_id);
create policy "Admins manage enrollments"
  on public.enrollments for all
  to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- LESSON PROGRESS
create policy "Users view own progress"
  on public.lesson_progress for select
  to authenticated
  using (auth.uid() = user_id or has_role(auth.uid(), 'admin'));
create policy "Users upsert own progress"
  on public.lesson_progress for insert
  to authenticated
  with check (auth.uid() = user_id);
create policy "Users update own progress"
  on public.lesson_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CERTIFICATES
create policy "Anyone can verify certificates"
  on public.certificates for select
  using (true);

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public)
values
  ('course-videos', 'course-videos', false),
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-resources', 'course-resources', false)
on conflict (id) do nothing;

-- Public read for thumbnails
create policy "Public read thumbnails"
  on storage.objects for select
  using (bucket_id = 'course-thumbnails');

-- Admin manages all course buckets
create policy "Admins manage course-videos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'course-videos' and has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'course-videos' and has_role(auth.uid(), 'admin'));

create policy "Admins manage course-thumbnails"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'course-thumbnails' and has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'course-thumbnails' and has_role(auth.uid(), 'admin'));

create policy "Admins manage course-resources"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'course-resources' and has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'course-resources' and has_role(auth.uid(), 'admin'));

-- Enrolled students can read videos & resources of their courses
create policy "Enrolled users read videos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'course-videos'
    and exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.enrollments e on e.course_id = m.course_id
      where e.user_id = auth.uid()
        and l.video_path = storage.objects.name
    )
  );

create policy "Enrolled users read resources"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'course-resources'
    and exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.enrollments e on e.course_id = m.course_id
      where e.user_id = auth.uid()
        and l.resource_path = storage.objects.name
    )
  );

-- ============ SEED 7 COURSES ============
insert into public.courses (slug, title, subtitle, description, price, duration, level, is_published)
values
  ('ai-tools-mastery', 'AI Tools Mastery Course', '15 Days · 100% Online',
   'Learn powerful AI tools like ChatGPT, Prompt Engineering, Lovable AI, AntiGravity AI, Figma, AI automation and AI content creation for productivity, freelancing and business growth.',
   999, '15 Days', 'Beginner', true),
  ('full-stack-web-development', 'Full Stack Web Development', '45 Days · 100% Online',
   'HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, React JS, PHP, MySQL, frontend-backend integration and website deployment.',
   999, '45 Days', 'Beginner', true),
  ('python-programming', 'Python Programming Course', '30 Days · 100% Online',
   'Master Python basics, loops, functions, OOP, file handling, mini projects, automation scripts and practical programming.',
   999, '30 Days', 'Beginner', true),
  ('ui-ux-figma', 'UI/UX Design with Figma', '20 Days · 100% Online',
   'Learn UI/UX design, wireframing, app design, website design, prototyping and design systems using Figma.',
   999, '20 Days', 'Beginner', true),
  ('graphic-design', 'Graphic Design Course', '25 Days · 100% Online',
   'Learn Canva, Photoshop basics, social media design, posters, flyers, branding and logo design.',
   999, '25 Days', 'Beginner', true),
  ('digital-marketing', 'Digital Marketing Course', '30 Days · 100% Online',
   'Social media marketing, Instagram growth, SEO basics, branding, lead generation and WhatsApp marketing.',
   999, '30 Days', 'Beginner', true),
  ('freelancing-business-growth', 'Freelancing & Business Growth', '15 Days · 100% Online',
   'Freelancing setup, client communication, proposal writing, portfolio building, pricing strategy and AI-powered business growth.',
   999, '15 Days', 'Beginner', true)
on conflict (slug) do nothing;
