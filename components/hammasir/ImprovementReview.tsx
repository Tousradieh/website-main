'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import {
  faNumber,
  hammasirApi,
  improvementCategoryLabel,
  matrixQuadrant,
  type PendingImprovement,
} from '@/lib/hammasir';

/** Keep in sync with workers/hammasir/src/engagement.ts IMPROVEMENT_FACTOR */
const IMPROVEMENT_FACTOR = 8;
const SCORES = [1, 2, 3, 4, 5];

interface ImprovementReviewProps {
  token: string;
  basePath?: string;
  projects: PendingImprovement[];
  onReviewed: () => void;
}

/** Score improvement projects on the ease/impact matrix (Duke Children's Hospital model). */
export default function ImprovementReview({ token, basePath = '/api/admin', projects, onReviewed }: ImprovementReviewProps) {
  const [scores, setScores] = useState<Record<number, { ease: number; impact: number; feedback: string }>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scoreOf = (id: number) => scores[id] ?? { ease: 3, impact: 3, feedback: '' };
  const setScore = (id: number, patch: Partial<{ ease: number; impact: number; feedback: string }>) =>
    setScores((prev) => ({ ...prev, [id]: { ...scoreOf(id), ...patch } }));

  const review = async (project: PendingImprovement, approve: boolean) => {
    const { ease, impact, feedback } = scoreOf(project.id);
    if (!approve && !feedback.trim()) {
      setError('برای رد کردن، در کادر نظر بنویسید چه چیزی باید تغییر کند.');
      return;
    }
    setBusy(project.id);
    setError(null);
    const result = await hammasirApi(`${basePath}/improvements/review`, {
      token,
      body: { id: project.id, approve, ease, impact, feedback },
    });
    setBusy(null);
    if (!result.ok) setError(result.error);
    onReviewed();
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="improvement-review">
      <h2 id="improvement-review" className="font-heading font-bold text-brand-900 text-lg">
        داوری پروژه‌های بهبود
        {projects.length ? (
          <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-xs text-brand-900 align-middle">
            {faNumber(projects.length)}
          </span>
        ) : null}
      </h2>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        به هر پروژه از ۱ تا ۵ برای «سهولت اجرا» (زمان و هزینه کم = عدد بالا) و «اثر استراتژیک» امتیاز دهید. امتیاز
        فرد = سهولت × اثر × {faNumber(IMPROVEMENT_FACTOR)} رادکوین.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">پروژه‌ای در انتظار داوری نیست.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {projects.map((project) => {
            const { ease, impact, feedback } = scoreOf(project.id);
            return (
              <li key={project.id} className="rounded-xl border border-border p-4 text-sm">
                <p className="font-bold text-brand-900">{project.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project.employeeName} · {project.teamName} · {improvementCategoryLabel(project.category)}
                  {project.teammates ? ` · هم‌تیمی‌ها: ${project.teammates}` : ''}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-brand-50 p-3">
                    <p className="text-xs font-bold text-brand-700">مشکل</p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">{project.problem}</p>
                  </div>
                  <div className="rounded-lg bg-brand-50 p-3">
                    <p className="text-xs font-bold text-brand-700">راه‌حل</p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">{project.solution}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-xs text-brand-900">
                    سهولت اجرا
                    <select
                      value={ease}
                      onChange={(e) => setScore(project.id, { ease: Number(e.target.value) })}
                      className={formFieldClass(false)}
                    >
                      {SCORES.map((n) => (
                        <option key={n} value={n}>
                          {faNumber(n)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-brand-900">
                    اثر استراتژیک
                    <select
                      value={impact}
                      onChange={(e) => setScore(project.id, { impact: Number(e.target.value) })}
                      className={formFieldClass(false)}
                    >
                      {SCORES.map((n) => (
                        <option key={n} value={n}>
                          {faNumber(n)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="mt-2 text-xs text-brand-900">
                  {matrixQuadrant(ease, impact)} · {faNumber(ease * impact * IMPROVEMENT_FACTOR)} رادکوین
                </p>
                <label className="mt-3 block text-xs text-brand-900">
                  نظر برای فرد (برای رد کردن الزامی)
                  <textarea
                    value={feedback}
                    onChange={(e) => setScore(project.id, { feedback: e.target.value })}
                    rows={2}
                    maxLength={1000}
                    className={`${formFieldClass(false)} w-full mt-1 resize-y`}
                  />
                </label>
                <div className="mt-3 flex gap-2">
                  {busy === project.id ? (
                    <Loader2 size={18} className="animate-spin text-brand-700" />
                  ) : (
                    <>
                      <Button type="button" variant="brand" onClick={() => review(project, true)} className="h-auto px-4 py-2 rounded-md">
                        <Check size={16} aria-hidden="true" />
                        تأیید با این امتیاز
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => review(project, false)}
                        className="h-auto px-4 py-2 rounded-md"
                      >
                        <X size={16} aria-hidden="true" />
                        رد
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
