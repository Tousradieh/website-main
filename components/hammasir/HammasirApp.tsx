'use client';

import { useCallback, useState } from 'react';
import { BookOpenCheck, LogOut, Trophy, Wallet } from 'lucide-react';
import { useStoredToken } from '@/hooks/useStoredToken';
import { cn } from '@/lib/utils';
import { hammasirApi, sessionToken } from '@/lib/hammasir';
import LoginForm from './LoginForm';
import StatusPanel from './StatusPanel';
import QuizPanel from './QuizPanel';
import LeaderboardPanel from './LeaderboardPanel';

const TABS = [
  { id: 'status', label: 'وضعیت من', icon: Wallet },
  { id: 'quizzes', label: 'کوییزها', icon: BookOpenCheck },
  { id: 'league', label: 'لیگ کارگاه‌ها', icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function HammasirApp() {
  // undefined = not read from storage yet (avoids a login-form flash on reload).
  const token = useStoredToken(sessionToken);
  const [tab, setTab] = useState<TabId>('status');

  const signIn = (value: string) => {
    sessionToken.set(value);
    setTab('status');
  };

  const signOut = useCallback(() => {
    const current = sessionToken.get();
    if (current) void hammasirApi('/api/logout', { token: current, body: {} });
    sessionToken.set(null);
  }, []);

  if (token === undefined) return null;
  if (!token) return <LoginForm onSignIn={signIn} />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <nav
          className="flex-1 grid grid-cols-3 gap-1 rounded-xl bg-card border border-border p-1"
          aria-label="بخش‌های کمپین"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn(
                'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-2.5 text-xs sm:text-sm font-medium transition-colors',
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
          onClick={signOut}
          className="shrink-0 rounded-xl border border-border bg-card p-3 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="خروج"
          title="خروج"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>

      {tab === 'status' ? <StatusPanel token={token} onSessionExpired={signOut} /> : null}
      {tab === 'quizzes' ? <QuizPanel token={token} onSessionExpired={signOut} /> : null}
      {tab === 'league' ? <LeaderboardPanel /> : null}
    </div>
  );
}
