import type { RefObject } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { aboutNavSections } from '@/lib/data';
import { cn } from '@/lib/utils';

interface AboutMenuProps {
  variant: 'desktop' | 'mobile';
  isOpen: boolean;
  isActive: boolean;
  label: string;
  onToggle: () => void;
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function AboutMenu({
  variant,
  isOpen,
  isActive,
  label,
  onToggle,
  onClose,
  containerRef,
}: AboutMenuProps) {
  const isDesktop = variant === 'desktop';

  return (
    <div
      className={cn(!isDesktop && 'px-2 py-1')}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex items-center font-medium transition-colors',
          isDesktop
            ? 'gap-1 rounded-md px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm duration-200 whitespace-nowrap'
            : 'w-full justify-between rounded-md px-3 py-3 text-sm',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-brand-100 hover:text-white hover:bg-white/10',
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{label}</span>
        <ChevronDown
          size={isDesktop ? 14 : 16}
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div
          className={cn(
            isDesktop
              ? 'absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/15 bg-brand-900 p-2 shadow-xl'
              : 'mt-1 space-y-1 rounded-md bg-brand-800 p-2',
          )}
        >
          <Link
            href="/about"
            onClick={onClose}
            className="block rounded-md px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {isDesktop ? 'درباره ما' : 'مشاهده صفحه'}
          </Link>
          {isDesktop ? <div className="my-1 border-t border-white/10" /> : null}
          {aboutNavSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={onClose}
              className="block rounded-md px-3 py-2.5 text-sm text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              {section.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
