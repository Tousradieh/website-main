import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  variable: '--font-vazir',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'توس‌رادیه | شرکت راه‌سازی و عمران',
  description:
    'شرکت توس‌رادیه پیشرو در راه‌سازی، ابنیه و ساختمان، تعمیر و نگهداری راه و محوطه و شهرک‌سازی. بیش از ۳۰ سال تجربه.',
  keywords: 'راه‌سازی, آسفالت, ابنیه و ساختمان, تعمیر و نگهداری راه, محوطه و شهرک‌سازی, مصالح, ایران',
  icons: {
    icon: '/logo.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e3a6e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={`bg-background ${vazirmatn.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
