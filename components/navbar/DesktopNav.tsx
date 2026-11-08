import type { RefObject } from 'react';
import Link from 'next/link';
import { navItems } from '@/lib/data';
import { Button } from '@/components/ui/button';
import AboutMenu from '@/components/navbar/AboutMenu';
import EmployeeMenu from '@/components/navbar/EmployeeMenu';
import { cn } from '@/lib/utils';

interface DesktopNavProps {
  isAboutMenuOpen: boolean;
  isEmployeeMenuOpen: boolean;
  onToggleAbout: () => void;
  onToggleEmployee: () => void;
  onCloseAbout: () => void;
  onCloseEmployee: () => void;
  isActive: (href: string) => boolean;
  aboutRef: RefObject<HTMLDivElement | null>;
  employeeRef: RefObject<HTMLDivElement | null>;
}

export default function DesktopNav({
  isAboutMenuOpen,
  isEmployeeMenuOpen,
  onToggleAbout,
  onToggleEmployee,
  onCloseAbout,
  onCloseEmployee,
  isActive,
  aboutRef,
  employeeRef,
}: DesktopNavProps) {
  return (
    <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
      {navItems.map((item) => {
        if (item.href === '/about') {
          return (
            <div key={item.href} className="relative">
              <AboutMenu
                variant="desktop"
                isOpen={isAboutMenuOpen}
                isActive={isActive('/about')}
                label={item.label}
                onToggle={onToggleAbout}
                onClose={onCloseAbout}
                containerRef={aboutRef}
              />
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-2.5 xl:px-3.5 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors duration-200 whitespace-nowrap',
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
        variant="desktop"
        isOpen={isEmployeeMenuOpen}
        onToggle={onToggleEmployee}
        onClose={onCloseEmployee}
        containerRef={employeeRef}
      />

      <Button
        nativeButton={false}
        render={<Link href="/cooperation" />}
        variant="accent"
        size="sm"
        className="mr-2 xl:mr-3 h-auto px-4 xl:px-5 py-2 text-xs xl:text-sm rounded-md"
      >
        همکاری با ما
      </Button>
    </div>
  );
}
