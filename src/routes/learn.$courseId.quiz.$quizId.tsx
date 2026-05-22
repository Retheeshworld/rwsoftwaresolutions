import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchQuiz,
  fetchQuizQuestionsForStudent,
  isEnrolled,
  submitQuizAttempt,
  type Quiz,
  type StudentQuestion,
} from "@/lib/lms";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/$courseId/quiz/$quizId")({
  head: () => ({ meta: [{ title: "Quiz — RW Software Solutions" }] }),
  component: () => (
    <RequireAuth>
      <QuizPage />
    </RequireAuth>
  ),
});

type Result = { attempt_id: string; score: number; total: number; percentage: number; passed: boolean };

function QuizPage() {
  const { courseId, quizId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [q, qs, enr] = await Promise.all([
          fetchQuiz(quizId),
          fetchQuizQuestionsForStudent(quizId),
          isEnrolled(courseId, user.id),
        ]);
        setQuiz(q);
        setQuestions(qs);
        setEnrolled(enr);
        if (q?.time_limit_minutes) setSecondsLeft(q.time_limit_minutes * 60);
      } catch (e) {
        toast.error("Could not load quiz");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, quizId, user]);

  // Countdown
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      void submit(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result]);

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => typeof answers[q.q_id] === "number"),
    [questions, answers],
  );

  const submit = async (auto = false) => {
    if (!auto && !allAnswered) {
      toast.error("Please answer every question first");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quizId, answers);
      if (res) setResult(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    if (quiz?.time_limit_minutes) setSecondsLeft(quiz.time_limit_minutes * 60);
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </SiteLayout>
    );
  }

  if (!quiz) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
        </div>
      </SiteLayout>
    );
  }

  if (!enrolled) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">You're not enrolled in this course</h1>
          <Link to="/courses" className="mt-4 inline-block">
            <Button className="rounded-full bg-gradient-brand text-white">Browse courses</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (result) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              result.passed ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
            }`}
          >
            {result.passed ? <Award className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </div>
          <h1 className="mt-5 text-3xl font-bold">
            {result.passed ? "You passed!" : "Not quite there yet"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            You scored <span className="font-semibold text-foreground">{result.score} / {result.total}</span> ({result.percentage}%).
            Pass mark is {quiz.pass_percentage}%.
          </p>
          {result.passed && quiz.is_final && (
            <p className="mt-2 text-sm text-emerald-600">
              Final assessment passed — your certificate will be issued once all lessons are complete.
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link to="/learn/$courseId/$lessonId" params={{ courseId, lessonId: "first" }}>
              <Button variant="outline" className="rounded-full">Back to course</Button>
            </Link>
            {!result.passed && (
              <Button onClick={retry} className="rounded-full bg-gradient-brand text-white">
                <RotateCcw className="h-4 w-4" /> Retry quiz
              </Button>
            )}
            {result.passed && (
              <Link to="/dashboard">
                <Button className="rounded-full bg-gradient-brand text-white">Go to dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ to: "/learn/$courseId/$lessonId", params: { courseId, lessonId: "first" } })}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to course
        </button>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              {questions.length} questions · Pass {quiz.pass_percentage}%
              {quiz.is_final && " · Final assessment"}
            </p>
          </div>
          {secondsLeft !== null && (
            <div className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold tabular-nums shadow-card">
              ⏱ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </div>
          )}
        </div>

        {quiz.description && <p className="mt-3 text-sm text-foreground/80">{quiz.description}</p>}

        {questions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            This quiz doesn't have any questions yet.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {questions.map((q, idx) => (
              <div key={q.q_id} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-start gap-3">
                  <span className="rounded-full bg-gradient-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                    Q{idx + 1}
                  </span>
                  <p className="font-medium">{q.q_question}</p>
                </div>
                <div className="space-y-2">
                  {q.q_options.map((opt, i) => {
                    const selected = answers[q.q_id] === i;
                    return (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-smooth ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.q_id}
                          checked={selected}
                          onChange={() => setAnswers((a) => ({ ...a, [q.q_id]: i }))}
                          className="h-4 w-4"
                        />
                        <span>{opt}</span>
                        {selected && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-elegant backdrop-blur">
              <span className="text-sm text-muted-foreground">
                {Object.keys(answers).length} / {questions.length} answered
              </span>
              <Button
                onClick={() => submit(false)}
                disabled={submitting || !allAnswered}
                className="bg-gradient-brand text-white"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit quiz"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
