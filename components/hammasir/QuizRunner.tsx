'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { faNumber, hammasirApi, type QuizDetail, type QuizResult } from '@/lib/hammasir';
import PanelState from './PanelState';
import QuizQuestions from './QuizQuestions';

interface QuizRunnerProps {
  quizId: number;
  token: string;
  onSessionExpired: () => void;
  onClose: () => void;
}

export default function QuizRunner({ quizId, token, onSessionExpired, onClose }: QuizRunnerProps) {
  const { data, error, reload } = useHammasirData<{ quiz: QuizDetail }>(
    `/api/quizzes/${quizId}`,
    token,
    onSessionExpired,
  );
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ result: QuizResult; answers: number[] } | null>(null);

  const back = (
    <button
      type="button"
      onClick={onClose}
      className="flex items-center gap-1 text-sm text-brand-700 hover:text-brand-900 mb-4"
    >
      <ArrowRight size={16} aria-hidden="true" />
      بازگشت به فهرست کوییزها
    </button>
  );

  if (!data) {
    return (
      <div>
        {back}
        <PanelState error={error} onRetry={reload} />
      </div>
    );
  }

  const { quiz } = data;
  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined && answers[i] !== null);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const result = await hammasirApi<{ result: QuizResult; answers: number[] }>(
      `/api/quizzes/${quiz.id}/submit`,
      { token, body: { answers } },
    );
    setSubmitting(false);
    if (result.ok) {
      setOutcome({ result: result.result, answers: result.answers });
    } else if (result.status === 401) {
      onSessionExpired();
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div>
      {back}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <p className="text-xs text-muted-foreground">هفته {faNumber(quiz.week)}</p>
        <h2 className="text-brand-900 font-heading font-bold text-xl mt-1">{quiz.title}</h2>

        <div className="mt-6">
          <QuizQuestions
            name={`quiz-${quiz.id}`}
            questions={quiz.questions}
            answers={answers}
            onAnswer={(qi, oi) =>
              setAnswers((prev) => {
                const next = [...prev];
                next[qi] = oi;
                return next;
              })
            }
            correctAnswers={outcome?.answers}
          />
        </div>

        {submitError ? (
          <p
            role="alert"
            className="mt-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3"
          >
            {submitError}
          </p>
        ) : null}

        {outcome ? (
          <>
            <p className="mt-6 rounded-xl bg-success-muted text-success px-4 py-3 font-bold" role="status">
              {faNumber(outcome.result.correct)} پاسخ درست از {faNumber(outcome.result.total)} ·{' '}
              {faNumber(outcome.result.earned)} رادکوین به کیف پول شما اضافه شد
            </p>
            <Button type="button" variant="brand" onClick={onClose} className="mt-4 w-full h-auto px-6 py-3.5 rounded-md">
              بازگشت
            </Button>
          </>
        ) : (
          <>
            <p className="mt-6 text-xs text-muted-foreground">هر کوییز فقط یک بار قابل ارسال است.</p>
            <Button
              type="button"
              variant="brand"
              disabled={!allAnswered || submitting}
              onClick={submit}
              className="mt-3 w-full h-auto px-6 py-3.5 rounded-md"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                'ثبت پاسخ‌ها'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
