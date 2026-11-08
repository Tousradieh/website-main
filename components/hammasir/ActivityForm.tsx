'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { ACTIVITY_KINDS, CAMPAIGN_WEEKS, hammasirApi, type ActivityKind } from '@/lib/hammasir';

interface ActivityFormProps {
  token: string;
  onAdded: () => void;
}

export default function ActivityForm({ token, onAdded }: ActivityFormProps) {
  const [kind, setKind] = useState<ActivityKind>('course');
  const [week, setWeek] = useState('1');
  const [points, setPoints] = useState('50');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await hammasirApi('/api/admin/activities', {
      token,
      body: { kind, week: Number(week), points: Number(points), title, description, link },
    });
    setLoading(false);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setMessage({ ok: true, text: 'ثبت شد.' });
    setTitle('');
    setDescription('');
    setLink('');
    onAdded();
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-brand-50 p-4 sm:p-5">
      <h3 className="font-bold text-brand-900 mb-4">افزودن دوره یا کلاس</h3>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5 text-sm text-brand-900">
          نوع
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ActivityKind)}
            className={formFieldClass(false)}
          >
            {ACTIVITY_KINDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-brand-900">
          هفته
          <select value={week} onChange={(e) => setWeek(e.target.value)} className={formFieldClass(false)}>
            {Array.from({ length: CAMPAIGN_WEEKS }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {(i + 1).toLocaleString('fa-IR')}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-brand-900">
          رادکوین
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            dir="ltr"
            className={formFieldClass(false)}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-brand-900 mt-3">
        عنوان
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={formFieldClass(false)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-brand-900 mt-3">
        توضیح (اختیاری؛ مثلاً زمان و محل کلاس)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={`${formFieldClass(false)} resize-y`}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-brand-900 mt-3">
        لینک محتوا (اختیاری؛ ویدیو، PDF یا صفحه دوره)
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://"
          dir="ltr"
          className={formFieldClass(false)}
        />
      </label>
      {message ? (
        <p role="status" className={`mt-3 text-sm ${message.ok ? 'text-success' : 'text-destructive'}`}>
          {message.text}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="brand"
        disabled={loading || !title.trim()}
        className="mt-4 h-auto px-6 py-2.5 rounded-md"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'ثبت'}
      </Button>
    </form>
  );
}
