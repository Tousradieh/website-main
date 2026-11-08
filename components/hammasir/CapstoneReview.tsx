'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { faNumber, hammasirApi, type PendingCapstone } from '@/lib/hammasir';

interface CapstoneReviewProps {
  token: string;
  /** '/api/admin' for the strategy team, '/api/team' for a manager's own unit. */
  basePath?: string;
  capstones: PendingCapstone[];
  onReviewed: () => void;
}

/** Approve or reject track final projects, with optional feedback shown to the employee. */
export default function CapstoneReview({ token, basePath = '/api/admin', capstones, onReviewed }: CapstoneReviewProps) {
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const review = async (capstone: PendingCapstone, approve: boolean) => {
    const key = `${capstone.employeeCode}-${capstone.trackId}`;
    if (!approve && !feedback[key]?.trim()) {
      setError('برای رد کردن، در کادر نظر بنویسید چه چیزی باید اصلاح شود.');
      return;
    }
    setBusy(key);
    setError(null);
    const result = await hammasirApi(`${basePath}/capstones/review`, {
      token,
      body: { employeeCode: capstone.employeeCode, trackId: capstone.trackId, approve, feedback: feedback[key] ?? '' },
    });
    setBusy(null);
    if (!result.ok) setError(result.error);
    onReviewed();
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-capstones">
      <h2 id="admin-capstones" className="font-heading font-bold text-brand-900 text-lg">
        پروژه‌های پایانی مسیرها
        {capstones.length ? (
          <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-xs text-brand-900 align-middle">
            {faNumber(capstones.length)}
          </span>
        ) : null}
      </h2>
      <p className="text-xs text-muted-foreground mt-1">
        امتیاز پروژه پایانی پس از تأیید به سهم ماموریت کیف پول و امتیاز واحد اضافه می‌شود. نظر شما به فرد نمایش داده
        می‌شود.
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {capstones.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">پروژه‌ای در انتظار بررسی نیست.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {capstones.map((capstone) => {
            const key = `${capstone.employeeCode}-${capstone.trackId}`;
            return (
              <li key={key} className="rounded-xl border border-border p-4">
                <p className="font-medium text-brand-900">
                  {capstone.employeeName}
                  <span className="text-xs font-normal text-muted-foreground">
                    {' '}
                    · {capstone.teamName} · کد {capstone.employeeCode}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {capstone.trackTitle} · {capstone.capstoneTitle} · {faNumber(capstone.points)} رادکوین
                </p>
                <div className="mt-3 max-h-72 overflow-y-auto rounded-lg bg-brand-50 p-3 text-sm leading-7 whitespace-pre-wrap text-brand-900">
                  {capstone.text}
                </div>
                <label className="mt-3 block text-sm text-brand-900">
                  نظر برای فرد (برای رد کردن الزامی)
                  <textarea
                    value={feedback[key] ?? ''}
                    onChange={(e) => setFeedback((prev) => ({ ...prev, [key]: e.target.value }))}
                    rows={2}
                    maxLength={1000}
                    className={`${formFieldClass(false)} w-full mt-1.5 resize-y`}
                  />
                </label>
                <div className="mt-3 flex gap-2">
                  {busy === key ? (
                    <Loader2 size={18} className="animate-spin text-brand-700" />
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="brand"
                        onClick={() => review(capstone, true)}
                        className="h-auto px-4 py-2 rounded-md"
                      >
                        <Check size={16} aria-hidden="true" />
                        تأیید
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => review(capstone, false)}
                        className="h-auto px-4 py-2 rounded-md"
                      >
                        <X size={16} aria-hidden="true" />
                        رد و درخواست اصلاح
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
