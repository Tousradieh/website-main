import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  ariaLabel: string;
  backgroundImage?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  ariaLabel,
  backgroundImage,
}: PageHeaderProps) {
  return (
    <section
      className={cn('relative pt-32 pb-16 bg-brand-900', backgroundImage && 'overflow-hidden')}
      aria-label={ariaLabel}
    >
      {backgroundImage ? (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
          />
        </div>
      ) : null}
      <div
        className={cn(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center',
          backgroundImage && 'relative z-10',
        )}
      >
        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
          {eyebrow}
        </span>
        <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
          {title}
        </h1>
        <p className="text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
