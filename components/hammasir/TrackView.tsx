'use client';

import { ArrowDown, ArrowRight, Award, CheckCircle2, ChevronLeft, ClipboardCheck, Lock, RotateCcw } from 'lucide-react';
import { useHammasirData } from '@/hooks/useHammasirData';
import { faNumber, PERSPECTIVES, type TrackDetail } from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import CapstoneForm from './CapstoneForm';
import PanelState from './PanelState';

interface TrackViewProps {
  trackId: string;
  token: string;
  onSessionExpired: () => void;
  onBack: () => void;
  onOpenModule: (moduleId: string) => void;
}

export default function TrackView({ trackId, token, onSessionExpired, onBack, onOpenModule }: TrackViewProps) {
  const { data, error, reload } = useHammasirData<{ track: TrackDetail }>(
    `/api/tracks/${trackId}`,
    token,
    onSessionExpired,
  );

  const back = (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1 text-sm text-brand-700 hover:text-brand-900 mb-4"
    >
      <ArrowRight size={16} aria-hidden="true" />
      همه مسیرها
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

  const { track } = data;
  const passed = track.modules.filter((module) => module.result?.passed).length;
  const { capstone } = track;
  const completed = capstone.submission?.status === 'approved';

  return (
    <div className="space-y-4">
      {back}

      <section className="rounded-2xl bg-brand-900 text-white p-5 sm:p-6" aria-labelledby="track-title">
        <h2 id="track-title" className="font-heading font-black text-xl sm:text-2xl leading-snug">
          {track.title}
        </h2>
        <p className="text-brand-100/80 text-sm mt-2 leading-relaxed">{track.description}</p>
        <p className="text-sm mt-4">
          {faNumber(passed)} از {faNumber(track.moduleCount)} درس گذرانده شده · تا {faNumber(track.maxPoints)} رادکوین
        </p>
        {completed ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-brand-900">
            <Award size={18} aria-hidden="true" />
            گواهی تکمیل این مسیر برای شما ثبت شد
          </p>
        ) : null}
      </section>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="track-outcomes">
        <h3 id="track-outcomes" className="font-heading font-bold text-brand-900">
          پس از این مسیر می‌توانید:
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
          {track.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              {outcome}
            </li>
          ))}
        </ul>
      </section>

      {track.learningMap.length ? (
        <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="track-map">
          <h3 id="track-map" className="font-heading font-bold text-brand-900">
            نقشه یادگیری: کار شما چطور به نتیجه شرکت می‌رسد
          </h3>
          <ol className="mt-4 flex flex-col-reverse gap-1">
            {track.learningMap.map((step, i) => (
              <li key={step.perspective} className="flex flex-col items-stretch">
                <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                  <p className="text-xs font-bold text-brand-700">{PERSPECTIVES[step.perspective]}</p>
                  <p className="mt-1 text-sm leading-relaxed text-brand-900">{step.text}</p>
                </div>
                {i > 0 ? (
                  <ArrowDown size={18} className="mx-auto my-1 rotate-180 text-brand-400" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {track.operationalTasks.length ? (
        <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="track-ops">
          <h3 id="track-ops" className="flex items-center gap-2 font-heading font-bold text-brand-900">
            <ClipboardCheck size={18} className="text-brand-700" aria-hidden="true" />
            ماموریت‌های عملیاتی واحد (۶۰٪ امتیاز)
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            امتیاز این کارها را مدیر یا تیم استراتژی از روی داده سامانه‌های شرکت ثبت می‌کند.
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-900">
            {track.operationalTasks.map((task) => (
              <li key={task} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                {task}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="track-modules">
        <h3 id="track-modules" className="font-heading font-bold text-brand-900 mb-3">
          درس‌ها
        </h3>
        <ol className="space-y-2">
          {track.modules.map((module, i) => {
            const result = module.result;
            return (
              <li key={module.id}>
                <button
                  type="button"
                  disabled={!module.open}
                  onClick={() => onOpenModule(module.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 text-right transition-colors',
                    module.open ? 'hover:border-brand-400' : 'opacity-60 cursor-default',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      result?.passed ? 'bg-success-muted text-success' : 'bg-brand-50 text-brand-800',
                    )}
                  >
                    {result?.passed ? <CheckCircle2 size={20} aria-label="قبول" /> : faNumber(i + 1)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-brand-900 text-sm sm:text-base">{module.title}</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {module.open
                        ? `${faNumber(module.minutes)} دقیقه مطالعه`
                        : `از هفته ${faNumber(module.week)} باز می‌شود`}
                      {result && !result.passed ? ' · نیاز به تلاش دوباره' : ''}
                      {result?.passed ? ` · ${faNumber(result.firstPoints)} رادکوین` : ''}
                    </span>
                  </span>
                  {!module.open ? (
                    <Lock size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
                  ) : result && !result.passed ? (
                    <RotateCcw size={18} className="text-gold shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronLeft size={20} className="text-brand-700 shrink-0" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="bg-card rounded-2xl border-2 border-gold/50 p-5 sm:p-6" aria-labelledby="track-capstone">
        <p className="text-xs font-medium text-brand-700">
          پروژه پایانی · {faNumber(capstone.points)} رادکوین {track.share === 'ai' ? 'مهارت هوش مصنوعی' : 'ماموریت'}
        </p>
        <h3 id="track-capstone" className="font-heading font-bold text-brand-900 text-lg mt-1">
          {capstone.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{capstone.brief}</p>
        <ol className="mt-3 space-y-1.5 text-sm text-brand-900 [list-style-type:persian] pr-5 leading-relaxed">
          {capstone.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <CapstoneForm trackId={track.id} capstone={capstone} token={token} onSessionExpired={onSessionExpired} onSubmitted={reload} />
      </section>

      <details className="bg-card rounded-2xl border border-border p-5 text-sm">
        <summary className="cursor-pointer font-medium text-brand-900">منابع این مسیر</summary>
        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground leading-relaxed" dir="auto">
          {track.sources.map((source) => (
            <li key={source} dir="auto">
              {source}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
