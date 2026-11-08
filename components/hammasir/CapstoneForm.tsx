'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { faNumber, hammasirApi, type TrackDetail } from '@/lib/hammasir';

/** Keep in sync with workers/hammasir/src/learning.ts */
const MIN_LENGTH = 80;
const MAX_LENGTH = 4000;

interface CapstoneFormProps {
  trackId: string;
  capstone: TrackDetail['capstone'];
  token: string;
  onSessionExpired: () => void;
  onSubmitted: () => void;
}

export default function CapstoneForm({ trackId, capstone, token, onSessionExpired, onSubmitted }: CapstoneFormProps) {
  const submission = capstone.submission;
  const [text, setText] = useState(submission?.status === 'rejected' ? submission.text : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submission?.status === 'approved') {
    return (
      <div className="mt-4 rounded-xl bg-success-muted px-4 py-3 text-sm text-success">
        <p className="flex items-center gap-1.5 font-bold">
          <CheckCircle2 size={16} aria-hidden="true" />
          تأیید شد · {faNumber(submission.points)} رادکوین
        </p>
        {submission.feedback ? <p className="mt-1 text-brand-900">نظر مدیر: {submission.feedback}</p> : null}
      </div>
    );
  }

  if (submission?.status === 'pending') {
    return (
      <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-gold/15 px-4 py-3 text-sm text-brand-900">
        <Clock size={16} aria-hidden="true" />
        گزارش شما ارسال شد و در انتظار بررسی مدیر است.
      </p>
    );
  }

  if (!capstone.available) {
    return (
      <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-muted-foreground">
        پس از قبولی در همه درس‌های این مسیر، می‌توانید گزارش پروژه پایانی را ارسال کنید.
      </p>
    );
  }

  const submit = async () => {
    setLoading(true);
    setError(null);
    const result = await hammasirApi(`/api/tracks/${trackId}/capstone`, { token, body: { text } });
    setLoading(false);
    if (result.ok) onSubmitted();
    else if (result.status === 401) onSessionExpired();
    else setError(result.error);
  };

  const length = text.trim().length;

  return (
    <div className="mt-4">
      {submission?.status === 'rejected' ? (
        <div className="mb-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="flex items-center gap-1.5 font-bold">
            <XCircle size={16} aria-hidden="true" />
            گزارش قبلی تأیید نشد؛ آن را اصلاح و دوباره ارسال کنید.
          </p>
          {submission.feedback ? <p className="mt-1 text-brand-900">نظر مدیر: {submission.feedback}</p> : null}
        </div>
      ) : null}
      <label htmlFor={`capstone-${trackId}`} className="text-sm font-medium text-brand-900">
        گزارش پروژه پایانی (همه بندهای بالا را بنویسید)
      </label>
      <textarea
        id={`capstone-${trackId}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        maxLength={MAX_LENGTH}
        className={`${formFieldClass(false)} w-full mt-1.5 resize-y leading-relaxed`}
      />
      <p className="mt-1 text-xs text-muted-foreground">
        {faNumber(length)} نویسه
        {length < MIN_LENGTH ? ` · حداقل ${faNumber(MIN_LENGTH)} نویسه` : ''}
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="brand"
        disabled={loading || length < MIN_LENGTH}
        onClick={submit}
        className="mt-3 w-full h-auto px-6 py-3 rounded-md"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : 'ارسال برای تأیید مدیر'}
      </Button>
    </div>
  );
}
