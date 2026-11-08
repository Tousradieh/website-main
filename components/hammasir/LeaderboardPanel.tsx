'use client';

import { Trophy } from 'lucide-react';
import { useHammasirData } from '@/hooks/useHammasirData';
import { faNumber, type TeamStanding } from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import PanelState from './PanelState';

const PODIUM = ['bg-gold text-brand-900', 'bg-grey-300 text-grey-900', 'bg-[#c58b5a] text-white'];

interface LeaderboardPanelProps {
  token: string;
  onSessionExpired: () => void;
}

export default function LeaderboardPanel({ token, onSessionExpired }: LeaderboardPanelProps) {
  const { data, error, reload } = useHammasirData<{ teams: TeamStanding[] }>(
    '/api/leaderboard',
    token,
    onSessionExpired,
  );
  if (!data) return <PanelState error={error} onRetry={reload} />;

  const { teams } = data;

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="league-heading">
      <h2 id="league-heading" className="flex items-center gap-2 text-brand-900 font-heading font-bold text-lg">
        <Trophy size={20} className="text-gold" aria-hidden="true" />
        لیگ کارگاه‌ها و واحدها
      </h2>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        امتیاز هر واحد میانگین رادکوین اعضای آن است؛ پس هر نفر که شرکت کند، به کل کارگاه کمک می‌کند.
      </p>

      <ol className="mt-5 space-y-2">
        {teams.map((team) => (
          <li key={team.id} className="flex items-center gap-3 rounded-xl bg-brand-50 px-3 py-3">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                PODIUM[team.rank - 1] ?? 'bg-white text-brand-800',
              )}
            >
              {faNumber(team.rank)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-900 truncate">{team.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1.5 flex-1 rounded-full bg-white overflow-hidden">
                  <div className="h-full rounded-full bg-success" style={{ width: `${team.participation}%` }} />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  مشارکت ٪{faNumber(team.participation)}
                </span>
              </div>
            </div>
            <span className="font-heading font-black text-brand-900 text-lg">{faNumber(team.score)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
