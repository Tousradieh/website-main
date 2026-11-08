import type { RefObject } from 'react';
import { ChevronDown } from 'lucide-react';
import { EMPLOYEE_PORTAL_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface EmployeeMenuProps {
  variant: 'desktop' | 'mobile';
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function EmployeeMenu({
  variant,
  isOpen,
  onToggle,
  onClose,
  containerRef,
}: EmployeeMenuProps) {
  const isDesktop = variant === 'desktop';

  return (
    <div
      className={cn(isDesktop ? 'relative mr-2 xl:mr-3' : 'px-2 py-1')}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex items-center font-medium text-brand-100 transition-colors hover:bg-white/10 hover:text-white',
          isDesktop
            ? 'gap-1.5 rounded-md px-2.5 xl:px-4 py-2 text-xs xl:text-sm duration-200 whitespace-nowrap'
            : 'w-full justify-between rounded-md px-3 py-3 text-sm',
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>پنل کارکنان</span>
        <ChevronDown
          size={16}
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div
          className={cn(
            isDesktop
              ? 'absolute left-0 top-full mt-2 w-72 rounded-lg border border-white/15 bg-brand-900 p-2 shadow-xl'
              : 'mt-1 space-y-1 rounded-md bg-brand-800 p-2',
          )}
        >
          {EMPLOYEE_PORTAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={onClose}
              className={cn(
                'block rounded-md px-3 py-3 transition-colors hover:bg-white/10',
                !isDesktop && 'text-right',
              )}
            >
              <span className="block text-sm font-semibold text-white">{link.label}</span>
              <span className="mt-1 block text-xs text-brand-100/70">{link.description}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
