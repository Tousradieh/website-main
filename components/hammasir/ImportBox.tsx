'use client';

import { useState, type ChangeEvent } from 'react';
import { Download, KeyRound, Loader2, X } from 'lucide-react';
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
  // PINs generated for new people by this import; shown once, never stored in the browser.
  const [pins, setPins] = useState<NonNullable<ImportResult['pins']>>([]);

  const downloadPins = () => {
    const rows = pins.map((p) => [p.code, p.name, p.pin].map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF"کد","نام","رمز"\n' + rows.join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `hammasir-pins-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
    if (result.pins?.length) setPins((prev) => [...prev, ...result.pins!]);
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
      {pins.length ? (
        <div role="alert" className="mt-3 rounded-xl border-2 border-gold bg-gold/10 p-3 text-xs text-brand-900">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 font-bold">
              <KeyRound size={14} aria-hidden="true" />
              رمز {faNumber(pins.length)} نفر جدید ساخته شد
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('فایل رمزها را دانلود کرده‌اید؟ بعد از بستن، رمزها دیگر نمایش داده نمی‌شوند.')) setPins([]);
              }}
              className="p-1 text-brand-900/60 hover:text-brand-900"
              aria-label="بستن فهرست رمزها"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 leading-relaxed">
            این رمزها فقط همین یک بار نمایش داده می‌شوند. فایل را دانلود و رمز هر نفر را جداگانه به خودش بدهید؛ سپس فایل را
            پاک کنید.
          </p>
          <Button type="button" variant="brand" onClick={downloadPins} className="mt-2 h-auto px-3 py-1.5 rounded-md text-xs">
            <Download size={14} aria-hidden="true" />
            دانلود فهرست رمزها (CSV)
          </Button>
          <ul className="mt-2 max-h-40 overflow-y-auto space-y-0.5" dir="ltr">
            {pins.map((p) => (
              <li key={p.code} className="flex justify-between gap-2 font-mono">
                <span>{p.code}</span>
                <span>{p.pin}</span>
              </li>
            ))}
          </ul>
        </div>
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
