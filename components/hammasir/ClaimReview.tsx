'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { activityKind, faNumber, hammasirApi, type PendingClaim } from '@/lib/hammasir';

interface ClaimReviewProps {
  token: string;
  /** '/api/admin' for the strategy team, '/api/team' for a manager's own unit. */
  basePath?: string;
  claims: PendingClaim[];
  onReviewed: () => void;
}

/** Approve or reject personnel reports of finished courses / attended classes. */
export default function ClaimReview({ token, basePath = '/api/admin', claims, onReviewed }: ClaimReviewProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const review = async (claim: PendingClaim, approve: boolean) => {
    setBusy(`${claim.employeeCode}-${claim.activityId}`);
    setError(null);
    const result = await hammasirApi(`${basePath}/claims/review`, {
      token,
      body: { employeeCode: claim.employeeCode, activityId: claim.activityId, approve },
    });
    setBusy(null);
    if (!result.ok) setError(result.error);
    onReviewed();
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-claims">
      <h2 id="admin-claims" className="font-heading font-bold text-brand-900 text-lg">
        در انتظار تأیید
        {claims.length ? (
          <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-xs text-brand-900 align-middle">
            {faNumber(claims.length)}
          </span>
        ) : null}
      </h2>
      <p className="text-xs text-muted-foreground mt-1">
        امتیاز دوره‌ها و کلاس‌ها فقط پس از تأیید به کیف پول پرسنل اضافه می‌شود.
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {claims.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">درخواستی در انتظار بررسی نیست.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {claims.map((claim) => {
            const key = `${claim.employeeCode}-${claim.activityId}`;
            return (
              <li key={key} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-900">
                    {claim.employeeName}
                    <span className="text-xs font-normal text-muted-foreground">
                      {' '}
                      · {claim.teamName} · کد {claim.employeeCode}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {activityKind(claim.kind).label}: {claim.activityTitle} · {faNumber(claim.points)} رادکوین
                  </p>
                  {claim.note ? <p className="text-xs text-brand-800 mt-1">«{claim.note}»</p> : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  {busy === key ? (
                    <Loader2 size={18} className="animate-spin text-brand-700" />
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="brand"
                        onClick={() => review(claim, true)}
                        className="h-auto px-3 py-2 rounded-md"
                      >
                        <Check size={16} aria-hidden="true" />
                        تأیید
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => review(claim, false)}
                        className="h-auto px-3 py-2 rounded-md"
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
