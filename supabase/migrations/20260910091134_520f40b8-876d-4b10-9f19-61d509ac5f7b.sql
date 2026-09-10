CREATE TABLE public.internship_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  college_name text NOT NULL,
  roll_number text NOT NULL,
  domain text NOT NULL,
  duration text NOT NULL,
  email text,
  phone text,
  amount integer NOT NULL DEFAULT 500,
  payment_method text NOT NULL DEFAULT 'upi',
  payment_reference text,
  payment_status text NOT NULL DEFAULT 'submitted',
  certificate_code text UNIQUE,
  issued_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.internship_certificates TO authenticated;
GRANT ALL ON public.internship_certificates TO service_role;

ALTER TABLE public.internship_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own certificate request"
  ON public.internship_certificates FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND payment_status = 'submitted'
    AND certificate_code IS NULL
    AND issued_at IS NULL
    AND amount = 500
    AND length(full_name) BETWEEN 2 AND 120
    AND length(college_name) BETWEEN 2 AND 160
    AND length(roll_number) BETWEEN 1 AND 60
    AND length(domain) BETWEEN 2 AND 80
    AND length(duration) BETWEEN 1 AND 60
  );

CREATE POLICY "Users read own certificate requests"
  ON public.internship_certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update certificate requests"
  ON public.internship_certificates FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete certificate requests"
  ON public.internship_certificates FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER internship_certificates_updated_at
  BEFORE UPDATE ON public.internship_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_internship_certificate(_id uuid)
RETURNS TABLE(
  id uuid, certificate_code text, issued_at timestamp with time zone,
  full_name text, college_name text, roll_number text, domain text, duration text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT c.id, c.certificate_code, c.issued_at, c.full_name, c.college_name,
         c.roll_number, c.domain, c.duration
  FROM public.internship_certificates c
  WHERE c.id = _id AND c.payment_status = 'paid' AND c.certificate_code IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.verify_internship_certificate(_code text)
RETURNS TABLE(
  id uuid, certificate_code text, issued_at timestamp with time zone,
  full_name text, college_name text, roll_number text, domain text, duration text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT c.id, c.certificate_code, c.issued_at, c.full_name, c.college_name,
         c.roll_number, c.domain, c.duration
  FROM public.internship_certificates c
  WHERE c.certificate_code = _code AND c.payment_status = 'paid';
$$;

REVOKE ALL ON FUNCTION public.get_internship_certificate(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_internship_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_internship_certificate(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_internship_certificate(text) TO anon, authenticated;