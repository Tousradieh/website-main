'use client';

import { useState } from 'react';
import { CheckCircle2, ClipboardCheck, Clock, Lightbulb, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { formFieldClass } from '@/lib/form-ui';
import {
  faNumber,
  hammasirApi,
  IMPROVEMENT_CATEGORIES,
  improvementCategoryLabel,
  matrixQuadrant,
  type ImprovementProject,
  type MeResponse,
} from '@/lib/hammasir';
import PanelState from './PanelState';

interface MissionsPanelProps {
  token: string;
  onSessionExpired: () => void;
}

const EMPTY = { title: '', category: '', problem: '', solution: '', teammates: '' };

export default function MissionsPanel({ token, onSessionExpired }: MissionsPanelProps) {
  const me = useHammasirData<MeResponse>('/api/me', token, onSessionExpired);
  const projects = useHammasirData<{ projects: ImprovementProject[] }>('/api/improvements', token, onSessionExpired);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!me.data) return <PanelState error={me.error} onRetry={me.reload} />;

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    const result = await hammasirApi('/api/improvements', { token, body: form });
    setLoading(false);
    if (result.ok) {
      setForm(EMPTY);
      setMessage({ ok: true, text: 'پروژه شما برای داوری مدیر ثبت شد.' });
      projects.reload();
    } else if (result.status === 401) {
      onSessionExpired();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  };

  const update = (field: keyof typeof EMPTY) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="ops-heading">
        <h2 id="ops-heading" className="flex items-center gap-2 font-heading font-bold text-brand-900">
          <ClipboardCheck size={18} className="text-brand-700" aria-hidden="true" />
          ماموریت‌های عملیاتی شما (۶۰٪ امتیاز)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          این کارها را در سامانه‌های شرکت انجام دهید. مدیر یا تیم استراتژی از روی داده سامانه‌ها، امتیاز شما و واحدتان
          را هر هفته ثبت می‌کند و در «وضعیت من» می‌بینید.
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-900">
          {me.data.operationalTasks.map((task) => (
            <li key={task} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
              {task}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card rounded-2xl border-2 border-gold/50 p-5 sm:p-6" aria-labelledby="improve-heading">
        <h2 id="improve-heading" className="flex items-center gap-2 font-heading font-bold text-brand-900">
          <Lightbulb size={18} className="text-gold" aria-hidden="true" />
          ثبت پروژه کوچک بهبود (جایزه بزرگ ماه سوم)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          ایده‌ای برای کاهش ضایعات، سوخت، خواب ماشین‌آلات، بهبود کار با سامانه‌ها یا هوش مصنوعی. مدیر آن را با دو معیار
          «سهولت اجرا» و «اثر استراتژیک» از ۱ تا ۵ امتیاز می‌دهد؛ امتیاز شما تا ۲۰۰ رادکوین ماموریت است.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            عنوان پروژه
            <input value={form.title} onChange={(e) => update('title')(e.target.value)} maxLength={120} className={formFieldClass(false)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            موضوع
            <select value={form.category} onChange={(e) => update('category')(e.target.value)} className={formFieldClass(false)}>
              <option value="">انتخاب کنید...</option>
              {IMPROVEMENT_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 flex flex-col gap-1.5 text-sm text-brand-900">
          مشکل چیست؟ (با عدد اگر ممکن است، مثلاً «فینیشر روزانه ۹۰ دقیقه منتظر آسفالت است»)
          <textarea
            value={form.problem}
            onChange={(e) => update('problem')(e.target.value)}
            rows={3}
            maxLength={2000}
            className={`${formFieldClass(false)} resize-y`}
          />
        </label>
        <label className="mt-3 flex flex-col gap-1.5 text-sm text-brand-900">
          راه‌حل پیشنهادی و نیازها (زمان، هزینه، تأیید)
          <textarea
            value={form.solution}
            onChange={(e) => update('solution')(e.target.value)}
            rows={3}
            maxLength={2000}
            className={`${formFieldClass(false)} resize-y`}
          />
        </label>
        <label className="mt-3 flex flex-col gap-1.5 text-sm text-brand-900">
          هم‌تیمی‌ها (اختیاری)
          <input
            value={form.teammates}
            onChange={(e) => update('teammates')(e.target.value)}
            maxLength={300}
            className={formFieldClass(false)}
          />
        </label>
        {message ? (
          <p role="status" className={`mt-3 text-sm ${message.ok ? 'text-success' : 'text-destructive'}`}>
            {message.text}
          </p>
        ) : null}
        <Button
          type="button"
          variant="brand"
          disabled={loading || !form.title.trim() || !form.category || form.problem.trim().length < 20 || form.solution.trim().length < 20}
          onClick={submit}
          className="mt-4 w-full h-auto px-6 py-3 rounded-md"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'ارسال برای داوری'}
        </Button>
      </section>

      {projects.data?.projects.length ? (
        <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="my-projects">
          <h2 id="my-projects" className="font-heading font-bold text-brand-900">
            پروژه‌های من
          </h2>
          <ul className="mt-3 space-y-3">
            {projects.data.projects.map((project) => (
              <li key={project.id} className="rounded-xl border border-border p-4 text-sm">
                <p className="font-bold text-brand-900">{project.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{improvementCategoryLabel(project.category)}</p>
                {project.status === 'pending' ? (
                  <p className="mt-2 flex items-center gap-1.5 text-brand-900">
                    <Clock size={14} aria-hidden="true" />
                    در انتظار داوری مدیر
                  </p>
                ) : null}
                {project.status === 'approved' && project.ease && project.impact ? (
                  <div className="mt-2 rounded-lg bg-success-muted px-3 py-2 text-success">
                    <p className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={14} aria-hidden="true" />
                      تأیید شد · {faNumber(project.points)} رادکوین
                    </p>
                    <p className="mt-1 text-xs text-brand-900">
                      سهولت اجرا {faNumber(project.ease)} از ۵ · اثر استراتژیک {faNumber(project.impact)} از ۵ ·{' '}
                      {matrixQuadrant(project.ease, project.impact)}
                    </p>
                  </div>
                ) : null}
                {project.status === 'rejected' ? (
                  <p className="mt-2 flex items-center gap-1.5 text-destructive">
                    <XCircle size={14} aria-hidden="true" />
                    تأیید نشد
                  </p>
                ) : null}
                {project.feedback ? <p className="mt-2 text-xs text-brand-900">نظر مدیر: {project.feedback}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
