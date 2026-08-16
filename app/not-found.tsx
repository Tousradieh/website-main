import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section
      className="relative flex min-h-[70vh] flex-col items-center justify-center bg-brand-900 px-4 pt-32 pb-20 text-center"
      aria-labelledby="not-found-heading"
    >
      <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
        خطا
      </span>
      <p className="text-accent font-black text-6xl md:text-7xl mb-4">۴۰۴</p>
      <h1
        id="not-found-heading"
        className="text-white font-heading font-black text-3xl md:text-4xl text-balance mb-4"
      >
        صفحه مورد نظر پیدا نشد
      </h1>
      <p className="text-brand-100/70 text-lg max-w-md mx-auto leading-relaxed mb-8">
        این آدرس وجود ندارد یا منتقل شده است. می‌توانید به صفحه اصلی برگردید یا با ما تماس بگیرید.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          variant="accent"
          className="h-auto px-8 py-3.5 rounded-md"
        >
          صفحه اصلی
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/contact" />}
          variant="outline-inverse"
          className="h-auto px-8 py-3.5 rounded-md"
        >
          تماس با ما
        </Button>
      </div>
    </section>
  );
}
