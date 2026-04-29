-- Internship applications table
CREATE TABLE public.internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  domain TEXT NOT NULL,
  duration TEXT,
  message TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous) can submit
CREATE POLICY "Anyone can submit application"
ON public.internship_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated users can see their own applications
CREATE POLICY "Users can view own applications"
ON public.internship_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all applications"
ON public.internship_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update (status changes)
CREATE POLICY "Admins can update applications"
ON public.internship_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete applications"
ON public.internship_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_internship_applications_updated_at
BEFORE UPDATE ON public.internship_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_internship_apps_created_at ON public.internship_applications(created_at DESC);

-- Storage bucket for resumes (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Anyone can upload to resumes bucket (so non-logged-in applicants work)
CREATE POLICY "Anyone can upload resumes"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'resumes');

-- Admins can view all resumes
CREATE POLICY "Admins can view resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete resumes
CREATE POLICY "Admins can delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));