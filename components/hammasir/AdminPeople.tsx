'use client';

import { useState } from 'react';
import { Dices, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { departmentLabel, faNumber, hammasirApi, type PersonRow } from '@/lib/hammasir';

interface AdminPeopleProps {
  token: string;
}

function toCsv(people: PersonRow[]): string {
  const header = ['کد', 'نام', 'واحد', 'حوزه', 'مدیر', 'عنوان شغل', 'دانش', 'هوش مصنوعی', 'ماموریت', 'جمع', 'درس قبول', 'مسیر تکمیل'];
  const escape = (value: string | number) => {
    const text = String(value);
    // Neutralise spreadsheet formulas and quote every cell.
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = people.map((p) =>
    [
      p.code,
      p.name,
      p.teamName,
      departmentLabel(p.department),
      p.isManager ? 'بله' : '',
      p.jobTitle,
      p.knowledge,
      p.ai,
      p.missions,
      p.total,
      p.modulesPassed,
      p.tracksCompleted,
    ].map(escape),
  );
  return '﻿' + [header.map(escape), ...rows].map((row) => row.join(',')).join('\n');
}

/** Export everyone's points (for HR and prize decisions) and run the weekly/monthly prize draw. */
export default function AdminPeople({ token }: AdminPeopleProps) {
  const [people, setPeople] = useState<PersonRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minPoints, setMinPoints] = useState('100');
  const [count, setCount] = useState('10');
  const [winners, setWinners] = useState<PersonRow[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const result = await hammasirApi<{ people: PersonRow[] }>('/api/admin/people', { token });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setPeople(result.people);
    return result.people;
  };

  const download = async () => {
    const list = people ?? (await load());
    if (!list) return;
    const url = URL.createObjectURL(new Blob([toCsv(list)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `hammasir-people-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const draw = async () => {
    const list = people ?? (await load());
    if (!list) return;
    const eligible = list.filter((p) => p.knowledge + p.ai >= Number(minPoints) && !p.isManager);
    // Fisher–Yates with a cryptographic random source.
    const pool = [...eligible];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setWinners(pool.slice(0, Number(count)));
  };

  const eligibleCount = people
    ? people.filter((p) => p.knowledge + p.ai >= Number(minPoints) && !p.isManager).length
    : null;

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-people">
      <h2 id="admin-people" className="font-heading font-bold text-brand-900 text-lg">
        خروجی پرسنل و قرعه‌کشی جوایز
      </h2>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        قرعه‌کشی بین پرسنلی که حداقل امتیاز آموزشی (دانش + هوش مصنوعی) را دارند انجام می‌شود؛ مدیران شرکت نمی‌کنند.
        نتیجه را پیش از اعلام ذخیره کنید.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Button type="button" variant="outline" onClick={download} disabled={loading} className="h-auto px-4 py-2 rounded-md">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} aria-hidden="true" />}
          دانلود فایل اکسل (CSV)
        </Button>
        <label className="flex flex-col gap-1 text-xs text-brand-900">
          حداقل امتیاز آموزشی
          <input type="number" min={0} value={minPoints} onChange={(e) => setMinPoints(e.target.value)} dir="ltr" className={`${formFieldClass(false)} w-28`} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-brand-900">
          تعداد برنده
          <input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} dir="ltr" className={`${formFieldClass(false)} w-24`} />
        </label>
        <Button type="button" variant="brand" onClick={draw} disabled={loading} className="h-auto px-4 py-2 rounded-md">
          <Dices size={16} aria-hidden="true" />
          قرعه‌کشی
        </Button>
      </div>
      {eligibleCount !== null ? (
        <p className="mt-2 text-xs text-muted-foreground">{faNumber(eligibleCount)} نفر واجد شرایط.</p>
      ) : null}
      {winners.length ? (
        <ol className="mt-3 space-y-1 text-sm [list-style-type:persian] pr-5">
          {winners.map((p) => (
            <li key={p.code}>
              {p.name} <span className="text-xs text-muted-foreground">· {p.teamName} · کد {p.code}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
