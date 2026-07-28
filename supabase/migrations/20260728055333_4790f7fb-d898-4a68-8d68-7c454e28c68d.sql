
-- 1. Certificates: drop public policy, add owner/admin read, add safe verify RPC
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.certificates;

CREATE POLICY "Owners and admins view certificates"
ON public.certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_certificate_by_id(_id uuid)
RETURNS TABLE (
  id uuid,
  certificate_code text,
  issued_at timestamptz,
  course_title text,
  student_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.certificate_code, c.issued_at, co.title, p.full_name
  FROM public.certificates c
  LEFT JOIN public.courses co ON co.id = c.course_id
  LEFT JOIN public.profiles p ON p.id = c.user_id
  WHERE c.id = _id;
$$;

REVOKE ALL ON FUNCTION public.get_certificate_by_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_certificate_by_id(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_certificate_by_code(_code text)
RETURNS TABLE (
  id uuid,
  certificate_code text,
  issued_at timestamptz,
  course_title text,
  student_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.certificate_code, c.issued_at, co.title, p.full_name
  FROM public.certificates c
  LEFT JOIN public.courses co ON co.id = c.course_id
  LEFT JOIN public.profiles p ON p.id = c.user_id
  WHERE c.certificate_code = _code;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO anon, authenticated;

-- 2. lead_events: prevent user_id spoofing
DROP POLICY IF EXISTS "Anyone can insert lead events" ON public.lead_events;

CREATE POLICY "Anyone can insert lead events"
ON public.lead_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type = ANY (ARRAY['whatsapp_click'::text, 'chat_open'::text, 'contact_submit'::text, 'course_enquiry'::text])
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- 3. resumes bucket: owners can read their own files
CREATE POLICY "Resume owners can read their files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
