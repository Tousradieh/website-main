import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact'
import JsonLd from '@/components/JsonLd'
import { BRAND_THEME_COLOR, SITE_NAME, SITE_URL } from '@/lib/constants'
import { organizationJsonLd } from '@/lib/seo'

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  variable: '--font-vazir',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | شرکت راه‌سازی و عمران`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'شرکت توس‌رادیه پیشرو در راه‌سازی، ابنیه و ساختمان، تعمیر و نگهداری راه و محوطه و شهرک‌سازی. بیش از ۳۰ سال تجربه.',
  keywords: [
    'راه‌سازی',
    'آسفالت',
    'ابنیه و ساختمان',
    'تعمیر و نگهداری راه',
    'محوطه و شهرک‌سازی',
    'مصالح',
    'توس‌رادیه',
    'مشهد',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | شرکت راه‌سازی و عمران`,
    description:
      'شرکت توس‌رادیه پیشرو در راه‌سازی، ابنیه و ساختمان، تعمیر و نگهداری راه و محوطه و شهرک‌سازی.',
    images: [
      {
        url: '/images/hero-road.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | شرکت راه‌سازی و عمران`,
    description:
      'شرکت توس‌رادیه پیشرو در راه‌سازی، ابنیه و ساختمان، تعمیر و نگهداری راه و محوطه و شهرک‌سازی.',
    images: ['/images/hero-road.png'],
  },
  icons: {
    icon: '/logo.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: BRAND_THEME_COLOR,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={`bg-background ${vazirmatn.variable}`}>
      <body className="font-sans antialiased">
        <JsonLd data={organizationJsonLd()} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground focus:font-medium"
        >
          رفتن به محتوای اصلی
        </a>
        <Navbar />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  )
}
