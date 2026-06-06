-- Restrict storage video/resource access to paid enrollments
DROP POLICY IF EXISTS "Enrolled users read videos" ON storage.objects;
DROP POLICY IF EXISTS "Enrolled users read resources" ON storage.objects;

CREATE POLICY "Enrolled paid users read videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course-videos' AND EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE e.user_id = auth.uid()
      AND e.payment_status = 'paid'
      AND l.video_path = objects.name
  )
);

CREATE POLICY "Enrolled paid users read resources"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course-resources' AND EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE e.user_id = auth.uid()
      AND e.payment_status = 'paid'
      AND l.resource_path = objects.name
  )
);

-- Restrict full lesson row access (including video_path/resource_path) to enrolled paid users and admins
DROP POLICY IF EXISTS "View lessons of viewable courses" ON public.lessons;

CREATE POLICY "Enrolled paid users or admins view lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE m.id = lessons.module_id
      AND e.user_id = auth.uid()
      AND e.payment_status = 'paid'
  )
);