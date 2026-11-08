import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import HammasirApp from '@/components/hammasir/HammasirApp';
import { HAMMASIR_NAME } from '@/lib/hammasir';

export const metadata: Metadata = {
  title: HAMMASIR_NAME,
  description: 'کمپین سه‌ماهه آماده‌سازی پرسنل توس‌رادیه: کوییزهای هفتگی، ماموریت‌ها و لیگ کارگاه‌ها.',
  robots: { index: false, follow: false },
  manifest: '/hammasir.webmanifest',
};

export default function HammasirPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ کمپین هم‌مسیر توس"
        eyebrow="ویژه پرسنل"
        title={HAMMASIR_NAME}
        description="روزی پنج دقیقه؛ یاد بگیرید، ماموریت انجام دهید و برای کارگاه خود رادکوین جمع کنید."
      />
      <section className="py-10 md:py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <HammasirApp />
        </div>
      </section>
    </>
  );
}
