'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CHAT_LINKS } from '@/lib/constants';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
} as const;

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-3">
      {open ? (
        <div
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-xl"
          role="menu"
          aria-label="راه‌های ارتباطی"
        >
          {CHAT_LINKS.map((link) => {
            const Icon = ICONS[link.id as keyof typeof ICONS] ?? MessageCircle;
            const external = link.href.startsWith('http');
            return (
              <a
                key={link.id}
                href={link.href}
                role="menuitem"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-50 transition-colors"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Icon size={16} className="text-accent" aria-hidden />
                {link.label}
              </a>
            );
          })}
          <Link
            href="/contact"
            role="menuitem"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-50 transition-colors"
          >
            <MessageCircle size={16} className="text-accent" aria-hidden />
            فرم تماس
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors',
          open ? 'bg-brand-800 text-white' : 'bg-accent text-accent-foreground',
        )}
        aria-expanded={open}
        aria-label={open ? 'بستن راه‌های ارتباطی' : 'باز کردن راه‌های ارتباطی'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
