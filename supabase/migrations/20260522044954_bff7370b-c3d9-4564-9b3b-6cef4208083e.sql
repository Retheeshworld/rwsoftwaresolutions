
-- ============ QUIZZES ============
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  module_id uuid,
  title text NOT NULL,
  description text,
  pass_percentage integer NOT NULL DEFAULT 70 CHECK (pass_percentage BETWEEN 0 AND 100),
  time_limit_minutes integer,
  is_final boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX idx_quizzes_module ON public.quizzes(module_id);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quizzes" ON public.quizzes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View quizzes of viewable courses" ON public.quizzes
  FOR SELECT TO public
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = quizzes.course_id
        AND (c.is_published = true OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE TRIGGER quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ QUIZ QUESTIONS ============
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL CHECK (correct_index >= 0),
  points integer NOT NULL DEFAULT 1 CHECK (points > 0),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quiz questions" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ QUIZ ATTEMPTS ============
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  percentage integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own attempts" ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============ UNIQUE CONSTRAINT ON CERTIFICATES (idempotent) ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificates_user_course_unique') THEN
    ALTER TABLE public.certificates ADD CONSTRAINT certificates_user_course_unique UNIQUE (user_id, course_id);
  END IF;
END $$;

-- ============ CERTIFICATE HELPER ============
CREATE OR REPLACE FUNCTION public.try_issue_certificate(_user uuid, _course uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int; v_done int; v_has_final boolean; v_passed_final boolean; v_code text;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = _course AND l.is_published = true;

  SELECT count(*) INTO v_done
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = _course AND lp.user_id = _user AND lp.completed = true AND l.is_published = true;

  IF v_total = 0 OR v_done < v_total THEN RETURN; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.quizzes WHERE course_id = _course AND is_final = true AND is_published = true
  ) INTO v_has_final;

  IF v_has_final THEN
    SELECT EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      JOIN public.quizzes q ON q.id = qa.quiz_id
      WHERE q.course_id = _course AND q.is_final = true AND qa.user_id = _user AND qa.passed = true
    ) INTO v_passed_final;
    IF NOT v_passed_final THEN RETURN; END IF;
  END IF;

  v_code := 'RW-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random()*99999))::int::text, 5, '0');
  INSERT INTO public.certificates (user_id, course_id, certificate_code)
  VALUES (_user, _course, v_code)
  ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$;

-- Replace old trigger function to delegate
CREATE OR REPLACE FUNCTION public.maybe_issue_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_course uuid;
BEGIN
  IF NEW.completed = false THEN RETURN NEW; END IF;
  SELECT m.course_id INTO v_course
  FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
  WHERE l.id = NEW.lesson_id;
  IF v_course IS NOT NULL THEN PERFORM public.try_issue_certificate(NEW.user_id, v_course); END IF;
  RETURN NEW;
END;
$$;

-- ============ STUDENT-FACING RPCS ============
-- Aliased column names so `position` is not a reserved keyword in RETURNS TABLE
CREATE OR REPLACE FUNCTION public.get_quiz_questions(_quiz_id uuid)
RETURNS TABLE (q_id uuid, q_question text, q_options jsonb, q_points integer, q_position integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = _quiz_id AND q.is_published = true
      AND (c.is_published = true OR public.has_role(auth.uid(), 'admin'))
  ) THEN RETURN; END IF;

  RETURN QUERY
    SELECT qq.id, qq.question, qq.options, qq.points, qq.position
    FROM public.quiz_questions qq WHERE qq.quiz_id = _quiz_id
    ORDER BY qq.position, qq.created_at;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions(uuid) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(_quiz_id uuid, _answers jsonb)
RETURNS TABLE (attempt_id uuid, score integer, total integer, percentage integer, passed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_pass int; v_score int := 0; v_total int := 0; v_pct int := 0; v_passed boolean := false;
  v_attempt_id uuid; v_course uuid; rec record; ans int;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT pass_percentage, course_id INTO v_pass, v_course FROM public.quizzes WHERE id = _quiz_id;
  IF v_pass IS NULL THEN RAISE EXCEPTION 'Quiz not found'; END IF;

  FOR rec IN SELECT qq.id, qq.correct_index, qq.points FROM public.quiz_questions qq WHERE qq.quiz_id = _quiz_id LOOP
    v_total := v_total + rec.points;
    BEGIN ans := (_answers ->> rec.id::text)::int; EXCEPTION WHEN OTHERS THEN ans := -1; END;
    IF ans = rec.correct_index THEN v_score := v_score + rec.points; END IF;
  END LOOP;

  IF v_total > 0 THEN v_pct := ROUND((v_score::numeric / v_total::numeric) * 100); END IF;
  v_passed := v_pct >= v_pass;

  INSERT INTO public.quiz_attempts (user_id, quiz_id, score, total, percentage, passed, answers)
  VALUES (v_user, _quiz_id, v_score, v_total, v_pct, v_passed, _answers)
  RETURNING id INTO v_attempt_id;

  IF v_passed THEN PERFORM public.try_issue_certificate(v_user, v_course); END IF;

  RETURN QUERY SELECT v_attempt_id, v_score, v_total, v_pct, v_passed;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) TO authenticated;
