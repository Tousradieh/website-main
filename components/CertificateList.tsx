'use client';

import { useState } from 'react';
import Image from 'next/image';
import { certificates } from '@/lib/data';
import type { Certificate } from '@/lib/types';
import Modal from '@/components/ui/modal';
import { X } from 'lucide-react';

export default function CertificateList() {
  const [selected, setSelected] = useState<Certificate | null>(null);

  return (
    <>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2 lg:gap-y-0">
        {certificates.map((cert) => (
          <li key={cert.id} className="border-b border-border">
            <button
              type="button"
              onClick={() => setSelected(cert)}
              className="flex flex-col sm:flex-row gap-5 sm:gap-6 py-8 w-full text-right hover:opacity-90 transition-opacity"
              aria-label={`مشاهده تصویر گواهی: ${cert.title}`}
            >
              <div className="relative w-24 h-32 flex-shrink-0 self-start bg-brand-50">
                <Image
                  src={cert.image}
                  alt={cert.title}
                  fill
                  className="object-contain p-1"
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-brand-900 text-xl mb-1 text-balance">
                  {cert.title}
                </h3>
                <p className="text-brand-600 text-sm mb-3">
                  {cert.issuer}
                  {cert.year ? ` — ${cert.year}` : ''}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">{cert.description}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <Modal
          onClose={() => setSelected(null)}
          labelledBy="certificate-modal-title"
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-4 left-4 z-20 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
          <div className="relative w-full min-h-[20rem] sm:min-h-[28rem] bg-brand-50 rounded-t-2xl">
            <Image
              src={selected.image}
              alt={selected.title}
              fill
              className="object-contain p-6"
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
            <p className="text-brand-600 text-sm mb-3">
              {selected.issuer}
              {selected.year ? ` — ${selected.year}` : ''}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">{selected.description}</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
