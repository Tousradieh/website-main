'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Gift, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { faNumber, hammasirApi, type StoreResponse } from '@/lib/hammasir';
import PanelState from './PanelState';

interface StorePanelProps {
  token: string;
  onSessionExpired: () => void;
}

const STATUS = {
  pending: { label: 'در حال آماده‌سازی', Icon: Clock, className: 'text-brand-900' },
  approved: { label: 'تحویل/تأیید شد', Icon: CheckCircle2, className: 'text-success' },
  rejected: { label: 'لغو شد؛ رادکوین برگشت داده شد', Icon: XCircle, className: 'text-destructive' },
} as const;

/** Reward store (Texaco Points model): spend earned Rad-Coins; HR fulfils requests. */
export default function StorePanel({ token, onSessionExpired }: StorePanelProps) {
  const { data, error, reload } = useHammasirData<StoreResponse>('/api/store', token, onSessionExpired);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!data) return <PanelState error={error} onRetry={reload} />;

  const redeem = async (rewardId: number, title: string, cost: number) => {
    if (!window.confirm(`«${title}» با ${faNumber(cost)} رادکوین درخواست شود؟`)) return;
    setBusy(rewardId);
    setMessage(null);
    const result = await hammasirApi('/api/store/redeem', { token, body: { rewardId } });
    setBusy(null);
    if (result.ok) {
      setMessage({ ok: true, text: 'درخواست شما ثبت شد و منابع انسانی آن را آماده می‌کند.' });
      reload();
    } else if (result.status === 401) {
      onSessionExpired();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-brand-900 text-white p-5 sm:p-6">
        <p className="text-sm text-brand-100">رادکوین قابل خرج</p>
        <p className="font-heading font-black text-3xl mt-1">{faNumber(data.wallet.balance)}</p>
        <p className="text-xs text-brand-100/70 mt-1">
          خرج کردن رادکوین رتبه کارگاه شما در لیگ را کم نمی‌کند؛ لیگ بر اساس کل امتیاز کسب‌شده است.
        </p>
      </section>

      {message ? (
        <p role="status" className={`text-sm ${message.ok ? 'text-success' : 'text-destructive'}`}>
          {message.text}
        </p>
      ) : null}

      {data.rewards.length === 0 ? (
        <p className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
          هنوز جایزه‌ای در فروشگاه ثبت نشده است.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.rewards.map((reward) => {
            const soldOut = reward.left !== null && reward.left <= 0;
            const affordable = data.wallet.balance >= reward.cost;
            return (
              <li key={reward.id} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-brand-900">
                    <Gift size={20} aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-900">{reward.title}</p>
                    {reward.description ? (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{reward.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-brand-900">
                    {faNumber(reward.cost)} <span className="text-xs font-normal text-muted-foreground">رادکوین</span>
                    {reward.left !== null ? (
                      <span className="mr-2 text-xs font-normal text-muted-foreground">
                        · {soldOut ? 'تمام شد' : `${faNumber(reward.left)} عدد باقی‌مانده`}
                      </span>
                    ) : null}
                  </span>
                  <Button
                    type="button"
                    variant="brand"
                    disabled={soldOut || !affordable || busy !== null}
                    onClick={() => redeem(reward.id, reward.title, reward.cost)}
                    className="h-auto px-4 py-2 rounded-md"
                  >
                    {busy === reward.id ? <Loader2 size={16} className="animate-spin" /> : affordable ? 'درخواست' : 'رادکوین کافی نیست'}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data.redemptions.length ? (
        <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="my-rewards">
          <h2 id="my-rewards" className="font-heading font-bold text-brand-900">
            درخواست‌های من
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {data.redemptions.map((item) => {
              const { label, Icon, className } = STATUS[item.status];
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="text-brand-900">{item.title}</span>
                  <span className={`flex items-center gap-1 text-xs ${className}`}>
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
