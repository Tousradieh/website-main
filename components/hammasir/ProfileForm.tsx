'use client';

import { useState } from 'react';
import { Loader2, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { hammasirApi } from '@/lib/hammasir';

interface ProfileFormProps {
  token: string;
  initial: { jobTitle: string; mobile: string };
  onSaved: () => void;
  onSessionExpired: () => void;
}

/** Digital profile (month-1 operational task); the first completion earns mission points. */
export default function ProfileForm({ token, initial, onSaved, onSessionExpired }: ProfileFormProps) {
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [mobile, setMobile] = useState(initial.mobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const result = await hammasirApi('/api/profile', { token, body: { jobTitle, mobile } });
    setLoading(false);
    if (result.ok) onSaved();
    else if (result.status === 401) onSessionExpired();
    else setError(result.error);
  };

  return (
    <section className="rounded-2xl border-2 border-dashed border-gold/60 bg-card p-5 sm:p-6" aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="flex items-center gap-2 font-heading font-bold text-brand-900">
        <UserRoundCheck size={18} className="text-brand-700" aria-hidden="true" />
        اولین ماموریت: تکمیل پروفایل دیجیتال
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">با تکمیل پروفایل، ۲۰ رادکوین ماموریت می‌گیرید.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-brand-900">
          عنوان شغل
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            maxLength={80}
            placeholder="مثلاً اپراتور فینیشر"
            className={formFieldClass(false)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-brand-900">
          شماره موبایل
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="tel"
            dir="ltr"
            placeholder="09xxxxxxxxx"
            className={formFieldClass(false)}
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="brand"
        disabled={loading || !jobTitle.trim() || !mobile.trim()}
        onClick={submit}
        className="mt-4 w-full sm:w-auto h-auto px-6 py-2.5 rounded-md"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'ثبت پروفایل'}
      </Button>
    </section>
  );
}
