'use client';

import { useState, type ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { faNumber, hammasirApi, type ImportResult } from '@/lib/hammasir';

interface ImportBoxProps {
  token: string;
  endpoint: string;
  title: string;
  columns: string;
  example: string;
  onImported: () => void;
}

/** Paste rows from Excel (or pick a CSV file) and send them to an admin import endpoint. */
export default function ImportBox({ token, endpoint, title, columns, example, onImported }: ImportBoxProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; lines: string[] } | null>(null);

  const readFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setText(await file.text());
    e.target.value = '';
  };

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    const result = await hammasirApi<ImportResult>(endpoint, { token, body: { text } });
    setLoading(false);
    if (!result.ok) {
      setMessage({ ok: false, lines: [result.error] });
      return;
    }
    setMessage({
      ok: result.errors.length === 0,
      lines: [`${faNumber(result.imported)} ردیف ثبت شد.`, ...result.errors],
    });
    if (result.errors.length === 0) setText('');
    onImported();
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 flex flex-col">
      <h2 className="font-heading font-bold text-brand-900">{title}</h2>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">ستون‌ها: {columns}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        dir="auto"
        placeholder={example}
        aria-label={`ردیف‌های ${title}`}
        className={`${formFieldClass(false)} mt-3 font-mono text-xs resize-y`}
      />
      <label className="mt-2 text-xs text-brand-700 cursor-pointer hover:underline">
        یا انتخاب فایل CSV
        <input type="file" accept=".csv,.txt,text/csv" onChange={readFile} className="sr-only" />
      </label>
      {message ? (
        <ul
          role="status"
          className={`mt-3 text-xs space-y-1 ${message.ok ? 'text-success' : 'text-destructive'}`}
        >
          {message.lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
      <Button
        type="button"
        variant="brand"
        disabled={loading || !text.trim()}
        onClick={submit}
        className="mt-4 h-auto px-4 py-2.5 rounded-md"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'ثبت'}
      </Button>
    </section>
  );
}
