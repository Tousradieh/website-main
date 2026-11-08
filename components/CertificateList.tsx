'use client';

import { useState } from 'react';
import Image from 'next/image';
import { certificates } from '@/lib/data';
import type { Certificate } from '@/lib/types';
import Modal from '@/components/ui/modal';
import { BadgeCheck, Award, X, ZoomIn } from 'lucide-react';

const certifications = certificates.filter((cert) => cert.kind === 'certification');
const appreciations = certificates.filter((cert) => cert.kind === 'appreciation');

function issuerLine(cert: Certificate) {
  return cert.year ? `${cert.issuer} — ${cert.year}` : cert.issuer;
}

export default function CertificateList() {
  const [selected, setSelected] = useState<Certificate | null>(null);

  return (
    <>
      <div className="mb-16 md:mb-20">
        <h3 className="flex items-center gap-2 font-heading font-black text-brand-900 text-2xl md:text-3xl mb-8">
          <BadgeCheck size={28} className="text-accent" aria-hidden="true" />
          گواهی‌نامه‌ها و عضویت‌ها
        </h3>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <li key={cert.id}>
              <button
                type="button"
                onClick={() => setSelected(cert)}
                className="group w-full h-full text-right bg-card rounded-2xl border border-border overflow-hidden flex flex-col sm:flex-row hover:shadow-lg hover:border-brand-500/40 transition-all"
                aria-label={`مشاهده تصویر: ${cert.title}`}
              >
                <div className="relative sm:w-56 h-56 sm:h-auto sm:min-h-56 flex-shrink-0 bg-brand-50">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width:640px) 100vw, 224px"
                  />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <p className="font-heading font-bold text-brand-900 text-xl mb-2 text-balance">
                    {cert.title}
                  </p>
                  <p className="text-brand-600 text-sm mb-3">{issuerLine(cert)}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{cert.description}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-2 font-heading font-black text-brand-900 text-2xl md:text-3xl mb-8">
          <Award size={28} className="text-accent" aria-hidden="true" />
          تقدیرنامه‌های کارفرمایان
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {appreciations.map((cert) => (
            <li key={cert.id}>
              <button
                type="button"
                onClick={() => setSelected(cert)}
                className="group w-full h-full text-right bg-card rounded-xl border border-border overflow-hidden flex flex-col hover:shadow-lg hover:border-brand-500/40 transition-all"
                aria-label={`مشاهده تصویر: ${cert.title}`}
              >
                <div className="relative aspect-[3/4] w-full bg-brand-50">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  />
                  <span className="absolute bottom-3 left-3 flex items-center justify-center w-9 h-9 rounded-full bg-brand-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={16} aria-hidden="true" />
                  </span>
                </div>
                <div className="p-4 flex-1">
                  <p className="font-heading font-bold text-brand-900 leading-snug mb-1.5 text-balance">
                    {cert.title}
                  </p>
                  <p className="text-brand-600 text-xs">{issuerLine(cert)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected ? (
        <Modal
          onClose={() => setSelected(null)}
          labelledBy="certificate-modal-title"
          className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-4 left-4 z-20 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
          <div className="relative w-full h-[60vh] min-h-[20rem] bg-brand-50 rounded-t-2xl">
            <Image
              src={selected.image}
              alt={selected.title}
              fill
              className="object-contain p-4 sm:p-6"
              sizes="(max-width:768px) 100vw, 768px"
            />
          </div>
          <div className="p-6">
            <h2
              id="certificate-modal-title"
              className="font-heading font-bold text-brand-900 text-xl mb-1 text-balance"
            >
              {selected.title}
            </h2>
            <p className="text-brand-600 text-sm mb-3">{issuerLine(selected)}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{selected.description}</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
