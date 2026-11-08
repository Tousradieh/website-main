'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import QuizPanel from './QuizPanel';
import ActivityPanel from './ActivityPanel';
import TracksPanel from './TracksPanel';

const SECTIONS = [
  { id: 'tracks', label: 'مسیرهای آموزشی' },
  { id: 'activities', label: 'دوره‌ها و کلاس‌ها' },
  { id: 'quizzes', label: 'کوییزهای هفتگی' },
] as const;

interface LearnPanelProps {
  token: string;
  onSessionExpired: () => void;
}

export default function LearnPanel({ token, onSessionExpired }: LearnPanelProps) {
  const [section, setSection] = useState<(typeof SECTIONS)[number]['id']>('tracks');

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="نوع آموزش">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            aria-pressed={section === id}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
              section === id
                ? 'border-brand-700 bg-brand-50 text-brand-900'
                : 'border-border text-muted-foreground hover:text-brand-900',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {section === 'tracks' ? <TracksPanel token={token} onSessionExpired={onSessionExpired} /> : null}
      {section === 'activities' ? <ActivityPanel token={token} onSessionExpired={onSessionExpired} /> : null}
      {section === 'quizzes' ? <QuizPanel token={token} onSessionExpired={onSessionExpired} /> : null}
    </div>
  );
}
