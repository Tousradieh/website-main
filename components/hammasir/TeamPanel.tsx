'use client';

import { useState } from 'react';
import { Loader2, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { formFieldClass } from '@/lib/form-ui';
import { departmentLabel, faNumber, hammasirApi, type TeamDashboard } from '@/lib/hammasir';
import CapstoneReview from './CapstoneReview';
import ClaimReview from './ClaimReview';
import ImprovementReview from './ImprovementReview';
import OkrBuilder from './OkrBuilder';
import PanelState from './PanelState';

interface TeamPanelProps {
  token: string;
  onSessionExpired: () => void;
}

/** Coaching & validation dashboard for managers: their unit's participation, approvals and messages. */
export default function TeamPanel({ token, onSessionExpired }: TeamPanelProps) {
  const { data, error, reload } = useHammasirData<TeamDashboard>('/api/team', token, onSessionExpired);
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  if (!data) return <PanelState error={error} onRetry={reload} />;

  const send = async () => {
    setSending(true);
    setSent(null);
    const result = await hammasirApi('/api/team/messages', { token, body: { to, text } });
    setSending(false);
    if (result.ok) {
      setText('');
      setSent('پیام ارسال شد.');
    } else if (result.status === 401) {
      onSessionExpired();
    } else {
      setSent(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-900 text-white p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm text-brand-100">
          <Users size={16} aria-hidden="true" />
          تیم من · {data.teamName}
        </p>
        <p className="font-heading font-black text-3xl mt-2">٪{faNumber(data.participation)}</p>
        <p className="text-xs text-brand-100/70 mt-1">
          مشارکت تیم در آموزش ({faNumber(data.members.length)} نفر). هدف جایزه مربیان برتر: بالای ۸۵٪.
        </p>
      </section>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="team-members">
        <h2 id="team-members" className="font-heading font-bold text-brand-900 text-lg mb-3">
          اعضای تیم
        </h2>
        {data.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز عضوی برای این واحد ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">نام</th>
                  <th className="py-2 px-2 font-medium">واحد</th>
                  <th className="py-2 px-2 font-medium">درس قبول</th>
                  <th className="py-2 px-2 font-medium">دانش</th>
                  <th className="py-2 px-2 font-medium">AI</th>
                  <th className="py-2 px-2 font-medium">ماموریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.members.map((member) => (
                  <tr key={member.code} className={member.knowledge + member.ai === 0 ? 'text-muted-foreground' : ''}>
                    <td className="py-2 px-2 text-brand-900 whitespace-nowrap">
                      {member.name}
                      {member.jobTitle ? <span className="block text-xs text-muted-foreground">{member.jobTitle}</span> : null}
                    </td>
                    <td className="py-2 px-2 text-xs">{departmentLabel(member.department)}</td>
                    <td className="py-2 px-2">{faNumber(member.modulesPassed)}</td>
                    <td className="py-2 px-2">{faNumber(member.knowledge)}</td>
                    <td className="py-2 px-2">{faNumber(member.ai)}</td>
                    <td className="py-2 px-2">{faNumber(member.missions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="team-message">
        <h2 id="team-message" className="font-heading font-bold text-brand-900">
          پیام تشویقی
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
          <select value={to} onChange={(e) => setTo(e.target.value)} className={formFieldClass(false)} aria-label="گیرنده">
            <option value="">گیرنده...</option>
            {data.members.map((member) => (
              <option key={member.code} value={member.code}>
                {member.name}
              </option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder="مثلاً: ثبت کامل چک‌لیست‌های این هفته عالی بود، ممنون!"
            className={formFieldClass(false)}
            aria-label="متن پیام"
          />
        </div>
        {sent ? (
          <p role="status" className="mt-2 text-sm text-brand-900">
            {sent}
          </p>
        ) : null}
        <Button
          type="button"
          variant="brand"
          disabled={!to || !text.trim() || sending}
          onClick={send}
          className="mt-3 h-auto px-5 py-2 rounded-md"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} aria-hidden="true" />}
          ارسال
        </Button>
      </section>

      <ImprovementReview token={token} basePath="/api/team" projects={data.pendingImprovements} onReviewed={reload} />
      <CapstoneReview token={token} basePath="/api/team" capstones={data.pendingCapstones} onReviewed={reload} />
      <ClaimReview token={token} basePath="/api/team" claims={data.pendingClaims} onReviewed={reload} />
      <OkrBuilder />
    </div>
  );
}
