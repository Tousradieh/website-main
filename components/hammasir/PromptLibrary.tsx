'use client';

import { useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { PROMPT_CATEGORIES, PROMPTS, type PromptCategory } from '@/lib/data/hammasir-prompts';
import { faNumber } from '@/lib/hammasir';
import { cn } from '@/lib/utils';

/** «بانک پرامپت راه‌سازی»: ready templates to copy into any AI assistant. */
export default function PromptLibrary() {
  const [category, setCategory] = useState<PromptCategory>('technical');
  const [copied, setCopied] = useState<string | null>(null);
  const prompts = PROMPTS.filter((item) => item.category === category);

  const copy = async (title: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(title);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked (old browser / insecure context): the text stays selectable.
    }
  };

  return (
    <div className="space-y-3">
      <p className="flex gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-brand-900">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        {faNumber(PROMPTS.length)} قالب آماده با فرمول نقش، داده، وظیفه و قالب خروجی. پیش از وارد کردن، نام‌ها، مبالغ و
        شماره قراردادها را ناشناس کنید و هر عدد و بند را با سند اصلی چک کنید.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="دسته پرامپت‌ها">
        {PROMPT_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            aria-pressed={category === item.id}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              category === item.id ? 'border-brand-700 bg-brand-50 text-brand-900' : 'border-border text-muted-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {prompts.map((item) => (
          <li key={item.title} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-brand-900 text-sm">{item.title}</p>
              <button
                type="button"
                onClick={() => copy(item.title, item.prompt)}
                className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-brand-700 hover:bg-brand-50"
              >
                {copied === item.title ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied === item.title ? 'کپی شد' : 'کپی'}
              </button>
            </div>
            <p className="mt-2 text-sm leading-7 text-foreground select-all">{item.prompt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
