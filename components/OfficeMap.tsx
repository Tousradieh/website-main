import { CONTACT, MAP_LINKS } from '@/lib/constants';

export default function OfficeMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <iframe
        title="موقعیت دفتر مرکزی توس‌رادیه روی نقشه"
        src={MAP_LINKS.osmEmbed}
        className="h-72 w-full md:h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex flex-wrap gap-3 border-t border-border px-4 py-3 text-sm">
        <a
          href={MAP_LINKS.neshan}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-700 hover:underline"
        >
          باز کردن در نشان
        </a>
        <span className="text-border" aria-hidden>
          |
        </span>
        <a
          href={MAP_LINKS.osm}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-700 hover:underline"
        >
          باز کردن در OpenStreetMap
        </a>
        <span className="mr-auto text-xs text-muted-foreground">{CONTACT.address}</span>
      </div>
    </div>
  );
}
