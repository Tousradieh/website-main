'use client';

import { Brain, HardHat, Users } from 'lucide-react';
import { useHammasirData } from '@/hooks/useHammasirData';
import { CAMPAIGN_PHASES, faNumber, type MeResponse } from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import PanelState from './PanelState';

interface StatusPanelProps {
  token: string;
  onSessionExpired: () => void;
}

export default function StatusPanel({ token, onSessionExpired }: StatusPanelProps) {
  const { data, error, reload } = useHammasirData<MeResponse>('/api/me', token, onSessionExpired);
  if (!data) return <PanelState error={error} onRetry={reload} />;

  const { employee, wallet, missions, team, teamCount, campaign } = data;
  const phase = CAMPAIGN_PHASES[campaign.phase - 1];
  const progress = Math.round((campaign.week / campaign.totalWeeks) * 100);

  return (
    <div className="space-y-4">
      {/* Wallet */}
      <section className="rounded-2xl bg-brand-900 text-white p-6" aria-labelledby="wallet-heading">
        <p className="text-brand-100/70 text-sm">
          {employee.name} · {employee.teamName}
        </p>
        <h2 id="wallet-heading" className="mt-3 text-sm text-brand-100">
          کیف پول رادکوین
        </h2>
        <p className="font-heading font-black text-4xl mt-1">
          {faNumber(wallet.total)} <span className="text-lg font-bold text-gold">رادکوین</span>
        </p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-xl bg-white/10 p-3">
            <div className="flex items-center gap-1.5 text-xs text-brand-100">
              <Brain size={14} aria-hidden="true" />
              امتیاز دانش (کوییز)
            </div>
            <p className="font-bold text-xl mt-1">{faNumber(wallet.knowledge)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <div className="flex items-center gap-1.5 text-xs text-brand-100">
              <HardHat size={14} aria-hidden="true" />
              امتیاز ماموریت‌ها
            </div>
            <p className="font-bold text-xl mt-1">{faNumber(wallet.missions)}</p>
          </div>
        </div>
      </section>

      {/* Campaign progress */}
      <section className="bg-card rounded-2xl border border-border p-6" aria-labelledby="campaign-heading">
        {campaign.week === 0 ? (
          <p id="campaign-heading" className="text-brand-900 font-medium">
            کمپین هنوز شروع نشده است. به‌زودی اولین کوییز باز می‌شود.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="campaign-heading" className="text-brand-900 font-heading font-bold">
                ماه {faNumber(campaign.phase)}: {phase.title}
              </h2>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                هفته {faNumber(campaign.week)} از {faNumber(campaign.totalWeeks)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{phase.goal}</p>
            <div
              className="mt-4 h-2 rounded-full bg-brand-50 overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
      </section>

      {/* Team standing */}
      {team ? (
        <section className="bg-card rounded-2xl border border-border p-6" aria-labelledby="team-heading">
          <h2 id="team-heading" className="flex items-center gap-2 text-brand-900 font-heading font-bold">
            <Users size={18} aria-hidden="true" />
            {team.name}
          </h2>
          <dl className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="rounded-xl bg-brand-50 p-3">
              <dt className="text-xs text-muted-foreground">رتبه در لیگ</dt>
              <dd className="font-bold text-xl text-brand-900 mt-1">
                {faNumber(team.rank)}
                <span className="text-xs font-normal text-muted-foreground"> از {faNumber(teamCount)}</span>
              </dd>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <dt className="text-xs text-muted-foreground">امتیاز واحد</dt>
              <dd className="font-bold text-xl text-brand-900 mt-1">{faNumber(team.score)}</dd>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <dt className="text-xs text-muted-foreground">مشارکت</dt>
              <dd className="font-bold text-xl text-brand-900 mt-1">٪{faNumber(team.participation)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {/* Mission history */}
      <section className="bg-card rounded-2xl border border-border p-6" aria-labelledby="missions-heading">
        <h2 id="missions-heading" className="text-brand-900 font-heading font-bold">
          ماموریت‌های ثبت‌شده
        </h2>
        {missions.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-3">
            هنوز امتیاز ماموریتی برای شما ثبت نشده است. ثبت منظم و بی‌خطای گزارش‌ها در سامانه‌های شرکت، امتیاز
            ماموریت می‌آورد.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {missions.map((mission, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="text-brand-900">{mission.note || 'ماموریت'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    هفته {faNumber(mission.week)} · {mission.kind === 'team' ? 'امتیاز تیمی واحد' : 'امتیاز شخصی'}
                  </p>
                </div>
                <span
                  className={cn('font-bold whitespace-nowrap', mission.points < 0 ? 'text-destructive' : 'text-success')}
                  dir="ltr"
                >
                  {mission.points > 0 ? '+' : ''}
                  {faNumber(mission.points)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
