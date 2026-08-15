import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BRAND_THEME_COLOR, SITE_NAME } from '@/lib/constants'

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  variable: '--font-vazir',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | شرکت راه‌سازی و عمران`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'شرکت توس‌رادیه پیشرو در راه‌سازی، ابنیه و ساختمان، تعمیر و نگهداری راه و محوطه و شهرک‌سازی. بیش از ۳۰ سال تجربه.',
  keywords: 'راه‌سازی, آسفالت, ابنیه و ساختمان, تعمیر و نگهداری راه, محوطه و شهرک‌سازی, مصالح, ایران',
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
      </body>
    </html>
  )
}
