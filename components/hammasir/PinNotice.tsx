'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound, X } from 'lucide-react';

interface PinNoticeProps {
  code: string;
  name: string;
  pin: string;
  onClose: () => void;
}

/** Shows a newly set PIN once; the server keeps only its hash, so it cannot be shown again. */
export default function PinNotice({ code, name, pin, onClose }: PinNoticeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${name} | کد پرسنلی: ${code} | رمز: ${pin}`);
      setCopied(true);
    } catch {
      // Clipboard blocked: the PIN is still visible to write down.
    }
  };

  return (
    <div role="alert" className="rounded-xl border-2 border-gold bg-gold/10 p-4">
      <div className="flex items-start gap-3">
        <KeyRound size={20} className="mt-0.5 shrink-0 text-brand-900" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-brand-900">
            رمز ورود <strong>{name}</strong> (کد {code}):
          </p>
          <p className="mt-1 font-mono text-2xl font-black tracking-[0.3em] text-brand-900" dir="ltr">
            {pin}
          </p>
          <p className="mt-2 text-xs text-brand-900/80 leading-relaxed">
            این رمز فقط همین یک بار نمایش داده می‌شود. آن را جداگانه و حضوری یا با پیام شخصی به خود فرد بدهید.
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-brand-900/20 px-2 py-1 text-xs text-brand-900 hover:bg-white/60"
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? 'کپی شد' : 'کپی برای ارسال'}
          </button>
        </div>
        <button type="button" onClick={onClose} className="p-1 text-brand-900/60 hover:text-brand-900" aria-label="بستن">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
