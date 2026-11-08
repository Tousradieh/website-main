'use client';

import { useState, type FormEvent } from 'react';
import { Archive, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { faNumber, hammasirApi, type AdminOverview } from '@/lib/hammasir';

interface AdminStoreProps {
  token: string;
  rewards: AdminOverview['rewards'];
  pending: AdminOverview['pendingRedemptions'];
  onChanged: () => void;
}

/** Reward catalogue and redemption requests (rejecting refunds the Rad-Coins). */
export default function AdminStore({ token, rewards, pending, onChanged }: AdminStoreProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('300');
  const [stock, setStock] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (path: string, body: unknown) => {
    setBusy(true);
    setMessage(null);
    const result = await hammasirApi(path, { token, body });
    setBusy(false);
    if (!result.ok) setMessage(result.error);
    onChanged();
    return result.ok;
  };

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await run('/api/admin/rewards', {
      title,
      description,
      cost: Number(cost),
      stock: stock.trim() ? Number(stock) : null,
    });
    if (ok) {
      setTitle('');
      setDescription('');
      setStock('');
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-store">
      <h2 id="admin-store" className="font-heading font-bold text-brand-900 text-lg">
        فروشگاه جوایز
      </h2>
      {message ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <h3 className="mt-4 text-sm font-bold text-brand-900">
        درخواست‌های در انتظار
        {pending.length ? (
          <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-xs text-brand-900">{faNumber(pending.length)}</span>
        ) : null}
      </h3>
      {pending.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">درخواستی نیست.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {pending.map((item) => (
            <li key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 text-sm">
              <span className="flex-1">
                <span className="font-medium text-brand-900">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {' '}
                  · {item.employeeName} · {item.teamName} · کد {item.employeeCode} · {faNumber(item.cost)} رادکوین
                </span>
              </span>
              <span className="flex gap-2">
                <Button
                  type="button"
                  variant="brand"
                  disabled={busy}
                  onClick={() => run('/api/admin/redemptions/review', { id: item.id, approve: true })}
                  className="h-auto px-3 py-1.5 rounded-md"
                >
                  <Check size={14} aria-hidden="true" />
                  تحویل شد
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => run('/api/admin/redemptions/review', { id: item.id, approve: false })}
                  className="h-auto px-3 py-1.5 rounded-md"
                >
                  <X size={14} aria-hidden="true" />
                  لغو و برگشت امتیاز
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-6 text-sm font-bold text-brand-900">جوایز فعال</h3>
      {rewards.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">هنوز جایزه‌ای ثبت نشده است.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {rewards.map((reward) => (
            <li key={reward.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                <span className="text-brand-900">{reward.title}</span>
                <span className="text-xs text-muted-foreground">
                  {' '}
                  · {faNumber(reward.cost)} رادکوین · {faNumber(reward.claimed)} درخواست
                  {reward.stock !== null ? ` از ${faNumber(reward.stock)}` : ''}
                </span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`«${reward.title}» از فروشگاه برداشته شود؟`)) {
                    void run(`/api/admin/rewards/${reward.id}/archive`, {});
                  }
                }}
                className="p-2 text-muted-foreground hover:text-destructive"
                aria-label={`برداشتن ${reward.title}`}
              >
                <Archive size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 rounded-xl bg-brand-50 p-4">
        <h3 className="font-bold text-brand-900 text-sm mb-3">افزودن جایزه</h3>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            عنوان
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={formFieldClass(false)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            قیمت (رادکوین)
            <input type="number" min={1} value={cost} onChange={(e) => setCost(e.target.value)} dir="ltr" className={formFieldClass(false)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            موجودی (خالی = نامحدود)
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} dir="ltr" className={formFieldClass(false)} />
          </label>
        </div>
        <label className="mt-3 flex flex-col gap-1.5 text-sm text-brand-900">
          توضیح (اختیاری)
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} className={formFieldClass(false)} />
        </label>
        <Button type="submit" variant="brand" disabled={busy || !title.trim()} className="mt-3 h-auto px-5 py-2 rounded-md">
          {busy ? <Loader2 size={16} className="animate-spin" /> : 'ثبت جایزه'}
        </Button>
      </form>
    </section>
  );
}
