import type { RefObject } from 'react';
import Link from 'next/link';
import { navItems } from '@/lib/data';
import { Button } from '@/components/ui/button';
import AboutMenu from '@/components/navbar/AboutMenu';
import EmployeeMenu from '@/components/navbar/EmployeeMenu';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  isAboutMenuOpen: boolean;
  isEmployeeMenuOpen: boolean;
  onToggleAbout: () => void;
  onToggleEmployee: () => void;
  onCloseAbout: () => void;
  onCloseEmployee: () => void;
  onCloseMenu: () => void;
  isActive: (href: string) => boolean;
  aboutRef: RefObject<HTMLDivElement | null>;
  employeeRef: RefObject<HTMLDivElement | null>;
}

export default function MobileNav({
  isOpen,
  isAboutMenuOpen,
  isEmployeeMenuOpen,
  onToggleAbout,
  onToggleEmployee,
  onCloseAbout,
  onCloseEmployee,
  onCloseMenu,
  isActive,
  aboutRef,
  employeeRef,
}: MobileNavProps) {
  return (
    <div
      id="mobile-menu"
      className={cn(
        'lg:hidden overflow-y-auto transition-all duration-300',
        isOpen ? 'max-h-[min(36rem,calc(100dvh-5rem))] pb-4' : 'max-h-0 overflow-hidden',
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
        {navItems.map((item) => {
          if (item.href === '/about') {
            return (
              <AboutMenu
                key={item.href}
                variant="mobile"
                isOpen={isAboutMenuOpen}
                isActive={isActive('/about')}
                label={item.label}
                onToggle={onToggleAbout}
                onClose={onCloseAbout}
                containerRef={aboutRef}
              />
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMenu}
              className={cn(
                'px-4 py-3 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-brand-100 hover:text-white hover:bg-white/10',
              )}
            >
              {item.label}
            </Link>
          );
        })}

        <EmployeeMenu
          variant="mobile"
          isOpen={isEmployeeMenuOpen}
          onToggle={onToggleEmployee}
          onClose={onCloseEmployee}
          containerRef={employeeRef}
        />

        <Button
          nativeButton={false}
          render={<Link href="/materials" onClick={onCloseMenu} />}
          variant="accent"
          className="mt-2 h-auto px-4 py-3 text-sm rounded-md"
        >
          درخواست مصالح
        </Button>
      </div>
    </div>
  );
}
