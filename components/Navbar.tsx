'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { aboutNavSections, navItems } from '@/lib/data';
import Logo from '@/components/Logo';

const employeePortalLinks = [
  {
    label: 'سامانه اتوماسیون',
    href: 'http://auto.tousradieh.com',
    description: 'ورود پرسنل به سامانه اتوماسیون',
  },
  {
    label: 'سامانه CMMS',
    href: 'http://car.tousradieh.com',
    description: 'سیستم تعمیرات و لجستیک',
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmployeeMenuOpen, setIsEmployeeMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const desktopEmployeeRef = useRef<HTMLDivElement>(null);
  const mobileEmployeeRef = useRef<HTMLDivElement>(null);
  const desktopAboutRef = useRef<HTMLDivElement>(null);
  const mobileAboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsEmployeeMenuOpen(false);
    setIsAboutMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      setIsEmployeeMenuOpen(false);
      setIsAboutMenuOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktopEmployee = desktopEmployeeRef.current?.contains(target);
      const inMobileEmployee = mobileEmployeeRef.current?.contains(target);
      const inDesktopAbout = desktopAboutRef.current?.contains(target);
      const inMobileAbout = mobileAboutRef.current?.contains(target);

      if (!inDesktopEmployee && !inMobileEmployee) {
        setIsEmployeeMenuOpen(false);
      }
      if (!inDesktopAbout && !inMobileAbout) {
        setIsAboutMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const closeMobileMenu = () => {
    setIsOpen(false);
    setIsEmployeeMenuOpen(false);
    setIsAboutMenuOpen(false);
  };

  const renderNavLink = (item: (typeof navItems)[number], compact = false) => {
    if (item.href === '/about') {
      return null;
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={
          compact
            ? `px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-brand-100 hover:text-white hover:bg-white/10'
              }`
            : `px-2.5 xl:px-3.5 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-brand-100 hover:text-white hover:bg-white/10'
              }`
        }
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-900/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-brand-900/80 backdrop-blur-sm'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="ناوبری اصلی"
      >
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group" aria-label="توس‌رادیه – صفحه اصلی">
            <Logo />
            <span className="text-white font-heading font-bold text-lg leading-tight">
              توس‌رادیه
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              if (item.href === '/about') {
                return (
                  <div key={item.href} className="relative" ref={desktopAboutRef}>
                    <button
                      type="button"
                      onClick={() => setIsAboutMenuOpen((prev) => !prev)}
                      className={`flex items-center gap-1 rounded-md px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                        isActive('/about')
                          ? 'bg-accent text-accent-foreground'
                          : 'text-brand-100 hover:text-white hover:bg-white/10'
                      }`}
                      aria-expanded={isAboutMenuOpen}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          isAboutMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isAboutMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-brand-950/95 p-2 shadow-xl">
                        <Link
                          href="/about"
                          onClick={() => setIsAboutMenuOpen(false)}
                          className="block rounded-md px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                          درباره ما
                        </Link>
                        <div className="my-1 border-t border-white/10" />
                        {aboutNavSections.map((section) => (
                          <Link
                            key={section.href}
                            href={section.href}
                            onClick={() => setIsAboutMenuOpen(false)}
                            className="block rounded-md px-3 py-2.5 text-sm text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            {section.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return renderNavLink(item);
            })}

            <div className="relative mr-2 xl:mr-3" ref={desktopEmployeeRef}>
              <button
                type="button"
                onClick={() => setIsEmployeeMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-md px-2.5 xl:px-4 py-2 text-xs xl:text-sm font-medium text-brand-100 transition-colors duration-200 hover:bg-white/10 hover:text-white whitespace-nowrap"
                aria-expanded={isEmployeeMenuOpen}
                aria-haspopup="true"
              >
                <span>پنل کارکنان</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isEmployeeMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isEmployeeMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 rounded-lg border border-white/10 bg-brand-950/95 p-2 shadow-xl">
                  {employeePortalLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsEmployeeMenuOpen(false)}
                      className="block rounded-md px-3 py-3 transition-colors hover:bg-white/10"
                    >
                      <span className="block text-sm font-semibold text-white">{link.label}</span>
                      <span className="mt-1 block text-xs text-brand-100/70">
                        {link.description}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/materials"
              className="mr-2 xl:mr-3 px-4 xl:px-5 py-2 rounded-md bg-accent text-accent-foreground text-xs xl:text-sm font-bold hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              درخواست مصالح
            </Link>
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`lg:hidden overflow-y-auto transition-all duration-300 ${
            isOpen ? 'max-h-[min(36rem,calc(100dvh-5rem))] pb-4' : 'max-h-0 overflow-hidden'
          }`}
          aria-hidden={!isOpen}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
            {navItems.map((item) => {
              if (item.href === '/about') {
                return (
                  <div key={item.href} className="px-2 py-1" ref={mobileAboutRef}>
                    <button
                      type="button"
                      onClick={() => setIsAboutMenuOpen((prev) => !prev)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                        isActive('/about')
                          ? 'bg-accent text-accent-foreground'
                          : 'text-brand-100 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-expanded={isAboutMenuOpen}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isAboutMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isAboutMenuOpen && (
                      <div className="mt-1 space-y-1 rounded-md bg-white/5 p-2">
                        <Link
                          href="/about"
                          onClick={closeMobileMenu}
                          className="block rounded-md px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                          مشاهده صفحه
                        </Link>
                        {aboutNavSections.map((section) => (
                          <Link
                            key={section.href}
                            href={section.href}
                            onClick={closeMobileMenu}
                            className="block rounded-md px-3 py-2.5 text-sm text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            {section.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-brand-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="px-2 py-1" ref={mobileEmployeeRef}>
              <button
                type="button"
                onClick={() => setIsEmployeeMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
                aria-expanded={isEmployeeMenuOpen}
              >
                <span>پنل کارکنان</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isEmployeeMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isEmployeeMenuOpen && (
                <div className="mt-1 space-y-1 rounded-md bg-white/5 p-2">
                  {employeePortalLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsEmployeeMenuOpen(false)}
                      className="block rounded-md px-3 py-3 text-right transition-colors hover:bg-white/10"
                    >
                      <span className="block text-sm font-semibold text-white">{link.label}</span>
                      <span className="mt-1 block text-xs text-brand-100/70">
                        {link.description}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/materials"
              onClick={closeMobileMenu}
              className="mt-2 px-4 py-3 rounded-md bg-accent text-accent-foreground text-sm font-bold text-center"
            >
              درخواست مصالح
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
