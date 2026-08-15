'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAVBAR_SCROLL_THRESHOLD_PX, SITE_NAME } from '@/lib/constants';
import { useClickOutside } from '@/hooks/useClickOutside';
import Logo from '@/components/Logo';
import DesktopNav from '@/components/navbar/DesktopNav';
import MobileNav from '@/components/navbar/MobileNav';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  return <NavbarChrome key={pathname} pathname={pathname} />;
}

function NavbarChrome({ pathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmployeeMenuOpen, setIsEmployeeMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopEmployeeRef = useRef<HTMLDivElement>(null);
  const mobileEmployeeRef = useRef<HTMLDivElement>(null);
  const desktopAboutRef = useRef<HTMLDivElement>(null);
  const mobileAboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > NAVBAR_SCROLL_THRESHOLD_PX);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useClickOutside([desktopEmployeeRef, mobileEmployeeRef], () => {
    setIsEmployeeMenuOpen(false);
  });
  useClickOutside([desktopAboutRef, mobileAboutRef], () => {
    setIsAboutMenuOpen(false);
  });

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const closeMobileMenu = () => {
    setIsOpen(false);
    setIsEmployeeMenuOpen(false);
    setIsAboutMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    if (isOpen) {
      closeMobileMenu();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-brand-900/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-brand-900/80 backdrop-blur-sm',
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="ناوبری اصلی">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group" aria-label={`${SITE_NAME} – صفحه اصلی`}>
            <Logo />
            <span className="text-white font-heading font-bold text-lg leading-tight">
              {SITE_NAME}
            </span>
          </Link>

          <DesktopNav
            isAboutMenuOpen={isAboutMenuOpen}
            isEmployeeMenuOpen={isEmployeeMenuOpen}
            onToggleAbout={() => setIsAboutMenuOpen((prev) => !prev)}
            onToggleEmployee={() => setIsEmployeeMenuOpen((prev) => !prev)}
            onCloseAbout={() => setIsAboutMenuOpen(false)}
            onCloseEmployee={() => setIsEmployeeMenuOpen(false)}
            isActive={isActive}
            aboutRef={desktopAboutRef}
            employeeRef={desktopEmployeeRef}
          />

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <MobileNav
          isOpen={isOpen}
          isAboutMenuOpen={isAboutMenuOpen}
          isEmployeeMenuOpen={isEmployeeMenuOpen}
          onToggleAbout={() => setIsAboutMenuOpen((prev) => !prev)}
          onToggleEmployee={() => setIsEmployeeMenuOpen((prev) => !prev)}
          onCloseAbout={closeMobileMenu}
          onCloseEmployee={() => setIsEmployeeMenuOpen(false)}
          onCloseMenu={closeMobileMenu}
          isActive={isActive}
          aboutRef={mobileAboutRef}
          employeeRef={mobileEmployeeRef}
        />
      </nav>
    </header>
  );
}
