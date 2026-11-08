'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Lightbulb, Loader2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { faNumber, hammasirApi, type ModuleDetail, type ModuleResult, type ModuleSubmitResult } from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import PanelState from './PanelState';
import QuizQuestions from './QuizQuestions';

interface ModuleViewProps {
  trackId: string;
  moduleId: string;
  token: string;
  onSessionExpired: () => void;
  onBack: () => void;
}

export default function ModuleView({ trackId, moduleId, token, onSessionExpired, onBack }: ModuleViewProps) {
  const { data, error, reload } = useHammasirData<{
    trackTitle: string;
    module: ModuleDetail;
    result: ModuleResult | null;
  }>(`/api/tracks/${trackId}/modules/${moduleId}`, token, onSessionExpired);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ModuleSubmitResult | null>(null);

  const back = (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1 text-sm text-brand-700 hover:text-brand-900 mb-4"
    >
      <ArrowRight size={16} aria-hidden="true" />
      {data ? data.trackTitle : 'بازگشت به مسیر'}
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

  const { module, result } = data;
  const allAnswered = module.quiz.every((_, i) => answers[i] !== undefined && answers[i] !== null);
  const alreadyPassed = result?.passed ?? false;

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const response = await hammasirApi<ModuleSubmitResult>(`/api/tracks/${trackId}/modules/${moduleId}/submit`, {
      token,
      body: { answers },
    });
    setSubmitting(false);
    if (response.ok) setOutcome(response);
    else if (response.status === 401) onSessionExpired();
    else setSubmitError(response.error);
  };

  const retry = () => {
    setOutcome(null);
    setAnswers([]);
    reload();
  };

  return (
    <article className="space-y-4">
      {back}

      <header className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={14} aria-hidden="true" />
          {faNumber(module.minutes)} دقیقه · هفته {faNumber(module.week)}
        </p>
        <h2 className="font-heading font-black text-brand-900 text-xl sm:text-2xl mt-2 leading-snug">{module.title}</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">{module.summary}</p>
      </header>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-6">
        {module.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="font-heading font-bold text-brand-900 text-lg">{section.heading}</h3>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mt-2 text-[0.95rem] leading-8 text-foreground">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-[0.95rem] leading-7">
                    <span className="mt-3 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <aside className="rounded-2xl bg-brand-50 border border-brand-100 p-5 sm:p-6" aria-label="نکات کلیدی">
        <h3 className="flex items-center gap-2 font-heading font-bold text-brand-900">
          <Lightbulb size={18} className="text-gold" aria-hidden="true" />
          نکات کلیدی
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-900">
          {module.keyPoints.map((point) => (
            <li key={point} className="flex gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </aside>

      <aside className="rounded-2xl border-2 border-dashed border-brand-400 p-5 sm:p-6" aria-label="اقدام این هفته">
        <h3 className="flex items-center gap-2 font-heading font-bold text-brand-900">
          <Target size={18} className="text-brand-700" aria-hidden="true" />
          اقدام این هفته در کار شما
        </h3>
        <p className="mt-2 text-sm leading-7 text-brand-900">{module.action}</p>
      </aside>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="module-quiz">
        <h3 id="module-quiz" className="font-heading font-bold text-brand-900 text-lg">
          آزمون درس
        </h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          برای قبولی حداقل ۷۰٪ پاسخ درست لازم است. امتیاز فقط از اولین تلاش حساب می‌شود؛ بعد از آن می‌توانید برای
          قبولی دوباره تلاش کنید.
        </p>
        {alreadyPassed && !outcome ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-success-muted px-3 py-2 text-sm text-success">
            <CheckCircle2 size={16} aria-hidden="true" />
            این درس را قبلاً با {faNumber(result!.firstPoints)} رادکوین گذرانده‌اید؛ می‌توانید برای مرور دوباره پاسخ دهید.
          </p>
        ) : null}

        <div className="mt-5">
          <QuizQuestions
            name={`module-${module.id}`}
            questions={module.quiz}
            answers={answers}
            onAnswer={(qi, oi) =>
              setAnswers((prev) => {
                const next = [...prev];
                next[qi] = oi;
                return next;
              })
            }
            correctAnswers={outcome?.answers}
            explanations={outcome?.explanations}
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
          <div className="mt-6 space-y-3">
            <p
              role="status"
              className={cn(
                'rounded-xl px-4 py-3 font-bold',
                outcome.result.passed ? 'bg-success-muted text-success' : 'bg-destructive/10 text-destructive',
              )}
            >
              {faNumber(outcome.result.correct)} پاسخ درست از {faNumber(outcome.result.total)} ·{' '}
              {outcome.result.passed ? 'قبول شدید' : 'هنوز قبول نشده‌اید'}
              {outcome.result.firstAttempt ? ` · ${faNumber(outcome.result.earned)} رادکوین` : ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {!outcome.result.passed ? (
                <Button type="button" variant="outline" onClick={retry} className="flex-1 h-auto px-6 py-3 rounded-md">
                  مرور درس و تلاش دوباره
                </Button>
              ) : null}
              <Button type="button" variant="brand" onClick={onBack} className="flex-1 h-auto px-6 py-3 rounded-md">
                بازگشت به مسیر
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="brand"
            disabled={!allAnswered || submitting}
            onClick={submit}
            className="mt-6 w-full h-auto px-6 py-3.5 rounded-md"
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
        )}
      </section>
    </article>
  );
}
