'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, GraduationCap, Loader2, Lock, Presentation, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { formFieldClass } from '@/lib/form-ui';
import { activityKind, faNumber, hammasirApi, type ActivitySummary } from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import PanelState from './PanelState';

interface ActivityPanelProps {
  token: string;
  onSessionExpired: () => void;
}

export default function ActivityPanel({ token, onSessionExpired }: ActivityPanelProps) {
  const { data, error, reload } = useHammasirData<{ activities: ActivitySummary[] }>(
    '/api/activities',
    token,
    onSessionExpired,
  );
  if (!data) return <PanelState error={error} onRetry={reload} />;

  if (data.activities.length === 0) {
    return (
      <p className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
        هنوز دوره یا کلاسی منتشر نشده است.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {data.activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          token={token}
          onSessionExpired={onSessionExpired}
          onClaimed={reload}
        />
      ))}
    </ul>
  );
}

interface ActivityCardProps {
  activity: ActivitySummary;
  token: string;
  onSessionExpired: () => void;
  onClaimed: () => void;
}

function ActivityCard({ activity, token, onSessionExpired, onClaimed }: ActivityCardProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kind = activityKind(activity.kind);
  const Icon = activity.kind === 'class' ? Presentation : GraduationCap;
  const status = activity.claim?.status;
  const canClaim = activity.open && (!status || status === 'rejected');

  const submit = async () => {
    setLoading(true);
    setError(null);
    const result = await hammasirApi(`/api/activities/${activity.id}/claim`, { token, body: { note } });
    setLoading(false);
    if (result.ok) {
      setFormOpen(false);
      setNote('');
      onClaimed();
    } else if (result.status === 401) {
      onSessionExpired();
    } else {
      setError(result.error);
    }
  };

  return (
    <li className={cn('rounded-2xl border border-border bg-card p-4', !activity.open && 'opacity-60')}>
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
          <Icon size={22} aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-brand-900">{activity.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {kind.label} · هفته {faNumber(activity.week)} · {faNumber(activity.points)} رادکوین پس از تأیید
          </p>
          {activity.description ? (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{activity.description}</p>
          ) : null}
          {activity.link && activity.open ? (
            <a
              href={activity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-brand-700 hover:underline"
            >
              مشاهده محتوا
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : null}
        </div>
        {!activity.open ? <Lock size={18} className="text-muted-foreground shrink-0" aria-label="هنوز باز نشده" /> : null}
      </div>

      {status === 'pending' ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-gold/15 px-3 py-2 text-sm text-brand-900">
          <Clock size={16} aria-hidden="true" />
          در انتظار تأیید مدیر
        </p>
      ) : null}
      {status === 'approved' ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-success-muted px-3 py-2 text-sm text-success font-bold">
          <CheckCircle2 size={16} aria-hidden="true" />
          تأیید شد · {faNumber(activity.points)} رادکوین
        </p>
      ) : null}
      {status === 'rejected' ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <XCircle size={16} aria-hidden="true" />
          تأیید نشد؛ در صورت نیاز با توضیح بیشتر دوباره اعلام کنید.
        </p>
      ) : null}

      {canClaim && !formOpen ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormOpen(true)}
          className="mt-3 w-full h-auto px-4 py-2.5 rounded-md"
        >
          {kind.claimLabel}
        </Button>
      ) : null}

      {canClaim && formOpen ? (
        <div className="mt-3 rounded-xl bg-brand-50 p-3">
          <label htmlFor={`claim-note-${activity.id}`} className="text-sm text-brand-900">
            توضیح برای مدیر (اختیاری)
          </label>
          <textarea
            id={`claim-note-${activity.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder={activity.kind === 'class' ? 'مثلاً تاریخ و محل کلاس' : 'مثلاً نکته‌ای که یاد گرفتید'}
            className={`${formFieldClass(false)} w-full mt-1.5 resize-none`}
          />
          {error ? (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="brand"
              disabled={loading}
              onClick={submit}
              className="flex-1 h-auto px-4 py-2.5 rounded-md"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'ارسال برای تأیید'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFormOpen(false)}
              className="h-auto px-4 py-2.5 rounded-md"
            >
              انصراف
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
