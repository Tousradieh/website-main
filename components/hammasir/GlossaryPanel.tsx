'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { GLOSSARY } from '@/lib/data/hammasir-glossary';
import { formFieldClass } from '@/lib/form-ui';

/** Illustrated strategy dictionary with road-building examples. */
export default function GlossaryPanel() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const terms = q
    ? GLOSSARY.filter((item) =>
        [item.term, item.english ?? '', item.meaning, item.example].some((field) => field.toLowerCase().includes(q)),
      )
    : GLOSSARY;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو: بهای تمام‌شده، OKR، شاخص پیش‌نگر..."
          aria-label="جستجو در فرهنگ‌نامه"
          className={`${formFieldClass(false)} w-full pr-9`}
        />
      </div>
      <dl className="space-y-3">
        {terms.map((item) => (
          <div key={item.term} className="rounded-2xl border border-border bg-card p-4">
            <dt className="font-bold text-brand-900">
              {item.term}
              {item.english ? (
                <span className="mr-2 text-xs font-normal text-muted-foreground" dir="ltr">
                  {item.english}
                </span>
              ) : null}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">{item.meaning}</dd>
            <dd className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-900">
              مثال: {item.example}
            </dd>
          </div>
        ))}
        {terms.length === 0 ? <p className="text-sm text-muted-foreground">چیزی پیدا نشد.</p> : null}
      </dl>
    </div>
  );
}
