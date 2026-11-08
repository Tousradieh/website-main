import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import AdminPanel from '@/components/hammasir/AdminPanel';
import { HAMMASIR_NAME } from '@/lib/hammasir';

export const metadata: Metadata = {
  title: `مدیریت ${HAMMASIR_NAME}`,
  robots: { index: false, follow: false },
};

export default function HammasirAdminPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ مدیریت کمپین"
        eyebrow="ویژه مدیران و منابع انسانی"
        title={`مدیریت ${HAMMASIR_NAME}`}
        description="ثبت واحدها، پرسنل، امتیاز ماموریت‌ها و کوییزهای هفتگی."
      />
      <section className="py-10 md:py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminPanel />
        </div>
      </section>
    </>
  );
}
