import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fetchQuiz, fetchQuizQuestionsAdmin, type Quiz, type QuizQuestion } from "@/lib/lms";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses/$courseId/quiz/$quizId")({
  head: () => ({ meta: [{ title: "Edit Quiz — Admin" }] }),
  component: () => (
    <RequireAuth requireAdmin>
      <EditQuizPage />
    </RequireAuth>
  ),
});

function EditQuizPage() {
  const { courseId, quizId } = Route.useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [q, qs] = await Promise.all([fetchQuiz(quizId), fetchQuizQuestionsAdmin(quizId)]);
      setQuiz(q);
      setQuestions(qs);
      setLoading(false);
    })();
  }, [quizId]);

  const saveQuiz = async () => {
    if (!quiz) return;
    setSaving(true);
    const { error } = await supabase
      .from("quizzes")
      .update({
        title: quiz.title,
        description: quiz.description,
        pass_percentage: quiz.pass_percentage,
        time_limit_minutes: quiz.time_limit_minutes,
        is_published: quiz.is_published,
      })
      .eq("id", quiz.id);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Quiz saved");
  };

  const addQuestion = async () => {
    const position = questions.length;
    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        question: "New question",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_index: 0,
        points: 1,
        position,
      })
      .select()
      .maybeSingle();
    if (error || !data) return toast.error("Could not add question");
    setQuestions((p) => [...p, data as QuizQuestion]);
  };

  const deleteQuiz = async () => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    await supabase.from("quizzes").delete().eq("id", quizId);
    toast.success("Quiz deleted");
    navigate({ to: "/admin/courses/$courseId", params: { courseId } });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!quiz) {
    return (
      <AdminLayout>
        <div className="p-10 text-center">Quiz not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/admin/courses/$courseId"
          params={{ courseId }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to course
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground">
          {quiz.is_final ? "Final assessment" : "Module quiz"} · {questions.length} questions
        </p>

        {/* Quiz meta */}
        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
            <Input
              className="mt-1"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pass % (0–100)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              className="mt-1"
              value={quiz.pass_percentage}
              onChange={(e) => setQuiz({ ...quiz, pass_percentage: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time limit (minutes, optional)
            </label>
            <Input
              type="number"
              min={0}
              className="mt-1"
              value={quiz.time_limit_minutes ?? ""}
              onChange={(e) =>
                setQuiz({
                  ...quiz,
                  time_limit_minutes: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={quiz.is_published}
                onChange={(e) => setQuiz({ ...quiz, is_published: e.target.checked })}
              />
              Published
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <Textarea
              rows={2}
              className="mt-1"
              value={quiz.description ?? ""}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button onClick={saveQuiz} disabled={saving} className="bg-gradient-brand text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save quiz</>}
            </Button>
            <Button variant="outline" className="ml-auto text-rose-600" onClick={deleteQuiz}>
              <Trash2 className="h-4 w-4" /> Delete quiz
            </Button>
          </div>
        </div>

        {/* Questions */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-bold">Questions</h2>
          <Button onClick={addQuestion} className="bg-gradient-brand text-white">
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {questions.map((q, idx) => (
            <QuestionEditor
              key={q.id}
              index={idx}
              question={q}
              onChange={(updated) =>
                setQuestions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
              }
              onDelete={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
            />
          ))}
          {questions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No questions yet. Click "Add question" to start.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function QuestionEditor({
  index,
  question,
  onChange,
  onDelete,
}: {
  index: number;
  question: QuizQuestion;
  onChange: (q: QuizQuestion) => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(question);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("quiz_questions")
      .update({
        question: local.question,
        options: local.options,
        correct_index: local.correct_index,
        points: local.points,
      })
      .eq("id", local.id);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Question saved");
    onChange(local);
  };

  const remove = async () => {
    if (!confirm("Delete this question?")) return;
    const { error } = await supabase.from("quiz_questions").delete().eq("id", local.id);
    if (error) return toast.error("Delete failed");
    onDelete();
  };

  const updateOption = (i: number, value: string) => {
    const next = [...local.options];
    next[i] = value;
    setLocal({ ...local, options: next });
  };

  const addOption = () => {
    if (local.options.length >= 6) return;
    setLocal({ ...local, options: [...local.options, "New option"] });
  };

  const removeOption = (i: number) => {
    if (local.options.length <= 2) return;
    const next = local.options.filter((_, idx) => idx !== i);
    const correct = local.correct_index >= next.length ? 0 : local.correct_index;
    setLocal({ ...local, options: next, correct_index: correct });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-gradient-brand px-2.5 py-0.5 text-xs font-semibold text-white">
          Q{index + 1}
        </span>
        <Input
          type="number"
          min={1}
          className="ml-auto w-24"
          value={local.points}
          onChange={(e) => setLocal({ ...local, points: Math.max(1, Number(e.target.value)) })}
          title="Points"
        />
        <span className="text-xs text-muted-foreground">pts</span>
      </div>
      <Textarea
        rows={2}
        value={local.question}
        onChange={(e) => setLocal({ ...local, question: e.target.value })}
        placeholder="Question text…"
      />
      <div className="mt-3 space-y-2">
        {local.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${local.id}`}
              checked={local.correct_index === i}
              onChange={() => setLocal({ ...local, correct_index: i })}
              title="Correct answer"
            />
            <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
            {local.options.length > 2 && (
              <Button size="sm" variant="ghost" onClick={() => removeOption(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        {local.options.length < 6 && (
          <Button size="sm" variant="outline" onClick={addOption}>
            <Plus className="h-3.5 w-3.5" /> Add option
          </Button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">
          Correct: <span className="font-semibold">Option {local.correct_index + 1}</span>
        </span>
        <Button size="sm" onClick={save} disabled={saving} className="ml-auto bg-gradient-brand text-white">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
        <Button size="sm" variant="outline" className="text-rose-600" onClick={remove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
