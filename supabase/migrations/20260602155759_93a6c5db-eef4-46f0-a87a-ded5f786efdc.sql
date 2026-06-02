
-- 1. Profiles: restrict SELECT to owner or admin
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2. Enrollments: force pending/0 on insert by users
DROP POLICY IF EXISTS "Users create own enrollments" ON public.enrollments;
CREATE POLICY "Users create own enrollments"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND payment_status = 'pending'
  AND amount_paid = 0
  AND status = 'active'
);

-- 3. Resume uploads: require auth + own-folder prefix
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Users upload own resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Course thumbnails: drop broad listing policy (public bucket still serves files via direct URL)
DROP POLICY IF EXISTS "Public read thumbnails" ON storage.objects;

-- 5. Contact + internship anon submissions: add basic length checks
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Anyone can submit application" ON public.internship_applications;
CREATE POLICY "Anyone can submit application"
ON public.internship_applications FOR INSERT TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 255
  AND length(domain) BETWEEN 1 AND 100
);

-- 6. Lock down SECURITY DEFINER functions: only allow callers that need them
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.maybe_issue_certificate() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.try_issue_certificate(uuid, uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_quiz_questions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) TO authenticated;

-- has_role is needed by RLS evaluated as authenticated; keep execute for authenticated only
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
