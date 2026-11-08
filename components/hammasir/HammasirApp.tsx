'use client';

import { useCallback, useState } from 'react';
import { BookOpenCheck, ClipboardCheck, Gift, LogOut, Trophy, Users, Wallet } from 'lucide-react';
import { useHammasirData } from '@/hooks/useHammasirData';
import { useStoredToken } from '@/hooks/useStoredToken';
import { cn } from '@/lib/utils';
import { HAMMASIR_APP_ID, hammasirApi, sessionToken, type MeResponse } from '@/lib/hammasir';
import LoginForm from './LoginForm';
import StatusPanel from './StatusPanel';
import LearnPanel from './LearnPanel';
import MissionsPanel from './MissionsPanel';
import StorePanel from './StorePanel';
import LeaderboardPanel from './LeaderboardPanel';
import TeamPanel from './TeamPanel';

const TABS = [
  { id: 'status', label: 'وضعیت من', icon: Wallet },
  { id: 'learn', label: 'آموزش', icon: BookOpenCheck },
  { id: 'missions', label: 'ماموریت‌ها', icon: ClipboardCheck },
  { id: 'store', label: 'جوایز', icon: Gift },
  { id: 'league', label: 'لیگ', icon: Trophy },
  { id: 'team', label: 'تیم من', icon: Users, managersOnly: true },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function HammasirApp() {
  // undefined = not read from storage yet (avoids a login-form flash on reload).
  const token = useStoredToken(sessionToken);

  const signOut = useCallback(() => {
    const current = sessionToken.get();
    if (current) void hammasirApi('/api/logout', { token: current, body: {} });
    sessionToken.set(null);
  }, []);

  if (token === undefined) return null;
  if (!token) return <LoginForm onSignIn={(value) => sessionToken.set(value)} />;
  return <SignedInApp token={token} onSignOut={signOut} />;
}

function SignedInApp({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<TabId>('status');
  // Only used to decide whether the manager tab is shown.
  const { data: me } = useHammasirData<MeResponse>('/api/me', token, onSignOut);
  const tabs = TABS.filter((item) => !('managersOnly' in item) || me?.employee.isManager);

  return (
    <div id={HAMMASIR_APP_ID} className="scroll-mt-24">
      <div className="flex items-start gap-2 mb-6">
        <nav
          className={cn(
            'flex-1 grid grid-cols-3 gap-1 rounded-xl bg-card border border-border p-1',
            tabs.length > 5 ? 'sm:grid-cols-6' : 'sm:grid-cols-5',
          )}
          aria-label="بخش‌های کمپین"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs sm:text-sm font-medium transition-colors',
                tab === id ? 'bg-brand-800 text-white' : 'text-brand-900 hover:bg-brand-50',
              )}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={onSignOut}
          className="shrink-0 rounded-xl border border-border bg-card p-3 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="خروج"
          title="خروج"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>

      {tab === 'status' ? <StatusPanel token={token} onSessionExpired={onSignOut} /> : null}
      {tab === 'learn' ? <LearnPanel token={token} onSessionExpired={onSignOut} /> : null}
      {tab === 'missions' ? <MissionsPanel token={token} onSessionExpired={onSignOut} /> : null}
      {tab === 'store' ? <StorePanel token={token} onSessionExpired={onSignOut} /> : null}
      {tab === 'league' ? <LeaderboardPanel token={token} onSessionExpired={onSignOut} /> : null}
      {tab === 'team' && me?.employee.isManager ? <TeamPanel token={token} onSessionExpired={onSignOut} /> : null}
    </div>
  );
}
