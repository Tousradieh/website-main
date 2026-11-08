'use client';

import { useState } from 'react';
import { Gauge, MapPin } from 'lucide-react';
import { facilityTypeLabels, productionSites } from '@/lib/data';
import type { FacilityType, ProductionSite } from '@/lib/types';
import { cn } from '@/lib/utils';

type Filter = FacilityType | 'all';

const PROVINCES: ProductionSite['province'][] = ['خراسان رضوی', 'خراسان جنوبی'];

/** Only offer filters for unit types that at least one site actually has. */
const FILTERS: Filter[] = [
  'all',
  ...(Object.keys(facilityTypeLabels) as FacilityType[]).filter((type) =>
    productionSites.some((site) => site.units.includes(type)),
  ),
];

export default function FacilityDirectory() {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = productionSites.filter(
    (site) => filter === 'all' || site.units.includes(filter),
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-10" role="group" aria-label="فیلتر نوع واحد">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
              filter === value
                ? 'bg-brand-900 text-white border-brand-900'
                : 'bg-card text-brand-800 border-border hover:border-brand-500/50',
            )}
          >
            {value === 'all' ? 'همه سایت‌ها' : facilityTypeLabels[value]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {PROVINCES.map((province) => {
          const sites = visible.filter((site) => site.province === province);
          return (
            <div key={province}>
              <h3 className="flex items-center gap-2 font-heading font-bold text-brand-900 text-lg mb-4">
                <MapPin size={18} className="text-accent" />
                {province}
                <span className="text-sm font-normal text-muted-foreground">
                  ({sites.length.toLocaleString('fa-IR')} سایت)
                </span>
              </h3>
              {sites.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-card rounded-xl border border-dashed border-border p-6 text-center">
                  سایتی از این نوع در این استان نیست.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {sites.map((site) => (
                    <li
                      key={site.id}
                      className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-brand-900 text-lg">
                          سایت {site.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {site.units.map((unit) => (
                            <span
                              key={unit}
                              className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-medium"
                            >
                              {facilityTypeLabels[unit]}
                            </span>
                          ))}
                        </div>
                        {site.note ? (
                          <p className="text-muted-foreground text-xs mt-2">{site.note}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-800 sm:text-left shrink-0">
                        <Gauge size={16} className="text-accent shrink-0" />
                        {site.capacity}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
