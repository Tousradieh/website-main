'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Copy, Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';

const MAX_KRS = 5;
/** Verbs that usually describe an activity, not a result. */
const ACTIVITY_WORDS = ['برگزاری', 'برگزار', 'انجام', 'تهیه', 'بررسی', 'پیگیری', 'تلاش', 'شرکت در', 'جلسه'];

interface Check {
  ok: boolean;
  text: string;
}

const hasNumber = (text: string) => /[0-9۰-۹٪%]/.test(text);

/** Rule-based feedback on an OKR (no AI service needed, works offline). */
function reviewOkr(objective: string, kpi: string, krs: string[]): { objective: Check[]; krs: Check[][] } {
  const filled = krs.filter((kr) => kr.trim());
  const objectiveChecks: Check[] = [
    { ok: objective.trim().length >= 10, text: 'هدف نوشته شده و روشن است.' },
    { ok: !hasNumber(objective), text: 'هدف کیفی و الهام‌بخش است؛ عدد در نتایج کلیدی می‌آید.' },
    { ok: kpi.trim().length > 0, text: 'به یک KPI ابلاغی وصل شده است.' },
    { ok: filled.length >= 3 && filled.length <= 4, text: 'سه تا چهار نتیجه کلیدی دارد.' },
  ];
  const krChecks = krs.map((kr) => {
    const text = kr.trim();
    if (!text) return [];
    return [
      { ok: hasNumber(text), text: 'عددی و قابل سنجش است.' },
      {
        ok: !ACTIVITY_WORDS.some((word) => text.startsWith(word) || text.includes(` ${word} `)),
        text: 'نتیجه است نه فعالیت (به جای «برگزاری جلسه» بنویسید چه عددی تغییر می‌کند).',
      },
      { ok: /(تا|پایان|ماه|هفته|فصل|روز)/.test(text), text: 'زمان یا مهلت مشخص دارد.' },
    ];
  });
  return { objective: objectiveChecks, krs: krChecks };
}

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {checks.map((check) => (
        <li key={check.text} className={`flex items-start gap-1.5 text-xs ${check.ok ? 'text-success' : 'text-brand-900'}`}>
          {check.ok ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-label="درست" />
          ) : (
            <CircleAlert size={14} className="mt-0.5 shrink-0 text-gold" aria-label="نیاز به اصلاح" />
          )}
          {check.text}
        </li>
      ))}
    </ul>
  );
}

/** «شبیه‌ساز OKR» for managers: write an objective and key results and get instant feedback. */
export default function OkrBuilder() {
  const [objective, setObjective] = useState('');
  const [kpi, setKpi] = useState('');
  const [krs, setKrs] = useState(['', '', '']);
  const [copied, setCopied] = useState(false);

  const feedback = useMemo(() => reviewOkr(objective, kpi, krs), [objective, kpi, krs]);
  const allChecks = [...feedback.objective, ...feedback.krs.flat()];
  const score = allChecks.length ? Math.round((allChecks.filter((c) => c.ok).length / allChecks.length) * 100) : 0;

  const copy = async () => {
    const text = [`KPI: ${kpi}`, `هدف: ${objective}`, ...krs.filter((kr) => kr.trim()).map((kr, i) => `نتیجه کلیدی ${i + 1}: ${kr}`)].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing else to do.
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="okr-builder">
      <h2 id="okr-builder" className="flex items-center gap-2 font-heading font-bold text-brand-900 text-lg">
        <Target size={20} className="text-brand-700" aria-hidden="true" />
        شبیه‌ساز OKR
      </h2>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        یک هدف سه‌ماهه برای واحد یا یکی از نیروهای کلیدی بنویسید؛ بازخورد فوری می‌گیرید. نتیجه را می‌توانید برای پروژه
        پایانی مسیر مدیران کپی کنید.
      </p>

      <label className="mt-4 flex flex-col gap-1.5 text-sm text-brand-900">
        KPI ابلاغی مرتبط
        <input
          value={kpi}
          onChange={(e) => setKpi(e.target.value)}
          placeholder="مثلاً درصد آمادگی فینیشرها"
          className={formFieldClass(false)}
        />
      </label>
      <label className="mt-3 flex flex-col gap-1.5 text-sm text-brand-900">
        هدف (Objective)
        <input
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="مثلاً به صفر رساندن توقف ناگهانی فینیشرها در فصل کاری"
          className={formFieldClass(false)}
        />
      </label>
      <CheckList checks={feedback.objective} />

      <div className="mt-4 space-y-3">
        {krs.map((kr, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <label className="flex flex-1 flex-col gap-1.5 text-sm text-brand-900">
                نتیجه کلیدی {(i + 1).toLocaleString('fa-IR')}
                <input
                  value={kr}
                  onChange={(e) => setKrs((prev) => prev.map((value, j) => (j === i ? e.target.value : value)))}
                  placeholder="مثلاً اجرای ۱۰۰٪ چک‌لیست بازدید روزانه در سامانه تا پایان ماه اول"
                  className={formFieldClass(false)}
                />
              </label>
              {krs.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setKrs((prev) => prev.filter((_, j) => j !== i))}
                  className="mt-6 p-2 text-muted-foreground hover:text-destructive"
                  aria-label={`حذف نتیجه کلیدی ${(i + 1).toLocaleString('fa-IR')}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {feedback.krs[i]?.length ? <CheckList checks={feedback.krs[i]} /> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {krs.length < MAX_KRS ? (
          <Button type="button" variant="outline" onClick={() => setKrs((prev) => [...prev, ''])} className="h-auto px-4 py-2 rounded-md">
            <Plus size={16} aria-hidden="true" />
            نتیجه کلیدی
          </Button>
        ) : null}
        <Button type="button" variant="brand" onClick={copy} disabled={!objective.trim()} className="h-auto px-4 py-2 rounded-md">
          <Copy size={16} aria-hidden="true" />
          {copied ? 'کپی شد' : 'کپی OKR'}
        </Button>
        <span className="text-sm text-brand-900 mr-auto">کیفیت OKR: ٪{score.toLocaleString('fa-IR')}</span>
      </div>
    </section>
  );
}
