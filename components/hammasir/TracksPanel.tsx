'use client';

import { useState } from 'react';
import {
  Briefcase,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Compass,
  Factory,
  FlaskConical,
  Handshake,
  HardHat,
  Sparkles,
  Target,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useHammasirData } from '@/hooks/useHammasirData';
import {
  audienceLabel,
  faNumber,
  HAMMASIR_APP_ID,
  type Department,
  type TrackIcon,
  type TrackSummary,
} from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import ModuleView from './ModuleView';
import PanelState from './PanelState';
import TrackView from './TrackView';

export const TRACK_ICONS: Record<TrackIcon, LucideIcon> = {
  compass: Compass,
  briefcase: Briefcase,
  users: Users,
  'hard-hat': HardHat,
  calculator: Calculator,
  handshake: Handshake,
  sparkles: Sparkles,
  factory: Factory,
  truck: Truck,
  flask: FlaskConical,
  target: Target,
};

interface TracksPanelProps {
  token: string;
  onSessionExpired: () => void;
}

/** Bring the app panel (not the page hero) back into view after navigating. */
function scrollToTop() {
  document.getElementById(HAMMASIR_APP_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TracksPanel({ token, onSessionExpired }: TracksPanelProps) {
  const { data, error, reload } = useHammasirData<{ tracks: TrackSummary[]; department: Department | null }>(
    '/api/tracks',
    token,
    onSessionExpired,
  );
  const [trackId, setTrackId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);

  const openTrack = (id: string | null) => {
    setTrackId(id);
    setModuleId(null);
    if (!id) reload();
    scrollToTop();
  };

  const openModule = (id: string | null) => {
    setModuleId(id);
    scrollToTop();
  };

  if (trackId && moduleId) {
    return (
      <ModuleView
        trackId={trackId}
        moduleId={moduleId}
        token={token}
        onSessionExpired={onSessionExpired}
        onBack={() => openModule(null)}
      />
    );
  }

  if (trackId) {
    return (
      <TrackView
        trackId={trackId}
        token={token}
        onSessionExpired={onSessionExpired}
        onBack={() => openTrack(null)}
        onOpenModule={openModule}
      />
    );
  }

  if (!data) return <PanelState error={error} onRetry={reload} />;

  return (
    <div className="space-y-3">
      {data.department ? null : (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-brand-900 leading-relaxed">
          واحد سازمانی شما هنوز ثبت نشده است. مسیر تخصصی واحد شما پس از ثبت توسط منابع انسانی نمایش داده می‌شود.
        </p>
      )}
      <ul className="space-y-3">
        {data.tracks.map((track) => {
          const Icon = TRACK_ICONS[track.icon] ?? Compass;
          const progress = Math.round((track.passedModules / track.moduleCount) * 100);
          const completed = track.capstoneStatus === 'approved';
          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => openTrack(track.id)}
                className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 text-right transition-colors hover:border-brand-400"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      'flex size-12 shrink-0 items-center justify-center rounded-xl',
                      completed ? 'bg-success-muted text-success' : 'bg-brand-50 text-brand-800',
                    )}
                  >
                    {completed ? <CheckCircle2 size={24} aria-hidden="true" /> : <Icon size={24} aria-hidden="true" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs text-brand-700 font-medium">
                      {audienceLabel(track.audience)}
                      {track.share === 'ai' ? ' · امتیاز مهارت هوش مصنوعی' : ''}
                    </span>
                    <span className="block font-bold text-brand-900 mt-0.5">{track.title}</span>
                    <span className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {track.description}
                    </span>
                  </span>
                  <ChevronLeft size={20} className="text-brand-700 shrink-0 mt-3" aria-hidden="true" />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="h-2 flex-1 rounded-full bg-brand-50 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`پیشرفت ${track.title}`}
                  >
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {faNumber(track.passedModules)} از {faNumber(track.moduleCount)} درس
                  </span>
                </div>
                {track.capstoneStatus === 'pending' ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-brand-900">
                    <Clock size={14} aria-hidden="true" />
                    پروژه پایانی در انتظار تأیید
                  </span>
                ) : null}
                {completed ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-success">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    مسیر با موفقیت کامل شد
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
