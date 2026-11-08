'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronLeft, Lock } from 'lucide-react';
import { useHammasirData } from '@/hooks/useHammasirData';
import { faNumber, type QuizSummary } from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import PanelState from './PanelState';
import QuizRunner from './QuizRunner';

interface QuizPanelProps {
  token: string;
  onSessionExpired: () => void;
}

export default function QuizPanel({ token, onSessionExpired }: QuizPanelProps) {
  const { data, error, reload } = useHammasirData<{ quizzes: QuizSummary[] }>(
    '/api/quizzes',
    token,
    onSessionExpired,
  );
  const [activeId, setActiveId] = useState<number | null>(null);

  if (activeId !== null) {
    return (
      <QuizRunner
        quizId={activeId}
        token={token}
        onSessionExpired={onSessionExpired}
        onClose={() => {
          setActiveId(null);
          void reload();
        }}
      />
    );
  }

  if (!data) return <PanelState error={error} onRetry={reload} />;

  if (data.quizzes.length === 0) {
    return (
      <p className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
        هنوز کوییزی منتشر نشده است.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {data.quizzes.map((quiz) => {
        const done = quiz.result !== null;
        return (
          <li key={quiz.id}>
            <button
              type="button"
              disabled={!quiz.open || done}
              onClick={() => setActiveId(quiz.id)}
              className={cn(
                'w-full flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-right transition-colors',
                quiz.open && !done ? 'hover:border-brand-400' : 'cursor-default',
                !quiz.open && 'opacity-60',
              )}
            >
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                  done ? 'bg-success-muted text-success' : 'bg-brand-50 text-brand-800',
                )}
              >
                {done ? <CheckCircle2 size={22} aria-hidden="true" /> : faNumber(quiz.week)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-brand-900 truncate">{quiz.title}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  هفته {faNumber(quiz.week)} · {faNumber(quiz.questionCount)} سؤال ·{' '}
                  {done
                    ? `${faNumber(quiz.result!.correct)} از ${faNumber(quiz.result!.total)} درست، ${faNumber(quiz.result!.earned)} رادکوین`
                    : `تا ${faNumber(quiz.points)} رادکوین`}
                </span>
              </span>
              {!quiz.open ? (
                <Lock size={18} className="text-muted-foreground" aria-label="هنوز باز نشده" />
              ) : !done ? (
                <ChevronLeft size={20} className="text-brand-700" aria-hidden="true" />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
