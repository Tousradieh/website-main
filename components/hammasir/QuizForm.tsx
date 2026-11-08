'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { CAMPAIGN_WEEKS, hammasirApi } from '@/lib/hammasir';

const QUESTIONS_TEMPLATE = `[
  {
    "q": "متن سؤال",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "answer": 0
  }
]`;

interface QuizFormProps {
  token: string;
  onAdded: () => void;
}

export default function QuizForm({ token, onAdded }: QuizFormProps) {
  const [week, setWeek] = useState('1');
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('100');
  const [questions, setQuestions] = useState(QUESTIONS_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let parsed: unknown;
    try {
      parsed = JSON.parse(questions);
    } catch {
      setMessage({ ok: false, text: 'متن سؤال‌ها JSON معتبر نیست.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await hammasirApi('/api/admin/quizzes', {
      token,
      body: { week: Number(week), title, points: Number(points), questions: parsed },
    });
    setLoading(false);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setMessage({ ok: true, text: 'کوییز ثبت شد.' });
    setTitle('');
    setQuestions(QUESTIONS_TEMPLATE);
    onAdded();
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-brand-50 p-4 sm:p-5">
      <h3 className="font-bold text-brand-900 mb-4">افزودن کوییز</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          رادکوین کامل
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            dir="ltr"
            className={formFieldClass(false)}
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1.5 text-sm text-brand-900">
          عنوان
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={formFieldClass(false)} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-brand-900 mt-3">
        سؤال‌ها (answer شماره گزینه درست است و از ۰ شروع می‌شود)
        <textarea
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          rows={10}
          dir="ltr"
          className={`${formFieldClass(false)} font-mono text-xs resize-y`}
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
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'ثبت کوییز'}
      </Button>
    </form>
  );
}
