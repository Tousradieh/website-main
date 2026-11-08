'use client';

import { faNumber } from '@/lib/hammasir';
import { cn } from '@/lib/utils';

interface QuizQuestionsProps {
  /** Prefix for radio group names, unique per quiz on the page. */
  name: string;
  questions: { q: string; options: string[] }[];
  answers: (number | null)[];
  onAnswer: (question: number, option: number) => void;
  /** Set after submission: correct option per question; locks the inputs. */
  correctAnswers?: number[];
  /** Optional explanation shown under each question after submission. */
  explanations?: string[];
}

/** Multiple-choice questions; after submission shows right/wrong options and explanations. */
export default function QuizQuestions({
  name,
  questions,
  answers,
  onAnswer,
  correctAnswers,
  explanations,
}: QuizQuestionsProps) {
  const graded = correctAnswers !== undefined;

  return (
    <ol className="space-y-6">
      {questions.map((question, qi) => (
        <li key={qi}>
          <fieldset>
            <legend className="font-medium text-brand-900 leading-relaxed">
              {faNumber(qi + 1)}. {question.q}
            </legend>
            <div className="mt-3 space-y-2">
              {question.options.map((option, oi) => {
                const chosen = answers[qi] === oi;
                const correct = correctAnswers?.[qi] === oi;
                return (
                  <label
                    key={oi}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                      graded
                        ? correct
                          ? 'border-success bg-success-muted'
                          : chosen
                            ? 'border-destructive bg-destructive/10'
                            : 'border-border'
                        : chosen
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-border cursor-pointer hover:border-brand-400',
                    )}
                  >
                    <input
                      type="radio"
                      name={`${name}-q${qi}`}
                      checked={chosen}
                      disabled={graded}
                      onChange={() => onAnswer(qi, oi)}
                      className="accent-brand-700 shrink-0"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {graded && explanations?.[qi] ? (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground bg-brand-50 rounded-lg px-3 py-2">
                {explanations[qi]}
              </p>
            ) : null}
          </fieldset>
        </li>
      ))}
    </ol>
  );
}
