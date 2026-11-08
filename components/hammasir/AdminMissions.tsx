'use client';

import { useState } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { formFieldClass } from '@/lib/form-ui';
import {
  CAMPAIGN_WEEKS,
  faNumber,
  hammasirApi,
  type AdminEmployee,
  type AdminMission,
  type AdminOverview,
} from '@/lib/hammasir';
import { cn } from '@/lib/utils';
import PanelState from './PanelState';

interface AdminMissionsProps {
  token: string;
  units: AdminOverview['units'];
  currentWeek: number;
  onChanged: () => void;
  onSessionExpired: () => void;
}

const WEEKS = Array.from({ length: CAMPAIGN_WEEKS }, (_, i) => i + 1);

/** Mission points table (the 60% operations share): add for a person or a whole unit, edit, delete. */
export default function AdminMissions({ token, units, currentWeek, onChanged, onSessionExpired }: AdminMissionsProps) {
  const missions = useHammasirData<{ missions: AdminMission[] }>('/api/admin/missions', token, onSessionExpired);
  const people = useHammasirData<{ employees: AdminEmployee[] }>('/api/admin/employees', token, onSessionExpired);
  const [targetKind, setTargetKind] = useState<'person' | 'team'>('person');
  const [target, setTarget] = useState('');
  const [week, setWeek] = useState(String(Math.max(1, currentWeek)));
  const [points, setPoints] = useState('20');
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState<{ id: number; week: string; points: string; note: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!missions.data || !people.data) {
    return <PanelState error={missions.error ?? people.error} onRetry={() => (missions.reload(), people.reload())} />;
  }

  const run = async (path: string, body: unknown) => {
    setBusy(true);
    setError(null);
    const result = await hammasirApi(path, { token, body });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    missions.reload();
    onChanged();
    return true;
  };

  // The person field accepts "code" or "code — name" picked from the suggestion list.
  const personCode = target.split('—')[0].trim();

  const add = async () => {
    const body = {
      week: Number(week),
      points: Number(points),
      note,
      ...(targetKind === 'person' ? { employeeCode: personCode } : { teamId: target }),
    };
    if (await run('/api/admin/missions/save', body)) {
      setTarget('');
      setNote('');
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const ok = await run('/api/admin/missions/save', {
      id: editing.id,
      week: Number(editing.week),
      points: Number(editing.points),
      note: editing.note,
    });
    if (ok) setEditing(null);
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-missions">
      <h2 id="admin-missions" className="font-heading font-bold text-brand-900 text-lg">
        امتیاز ماموریت‌ها
      </h2>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        امتیاز کار واقعی در سامانه‌ها (سهم ۶۰٪). امتیاز واحد به همه اعضای آن واحد می‌رسد. برای اصلاح اشتباه، ردیف را
        ویرایش یا حذف کنید.
      </p>

      <div className="mt-4 rounded-xl bg-brand-50 p-4">
        <div className="flex gap-2 text-sm" role="group" aria-label="نوع گیرنده">
          {(['person', 'team'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={targetKind === kind}
              onClick={() => {
                setTargetKind(kind);
                setTarget('');
              }}
              className={cn(
                'rounded-full border px-3 py-1',
                targetKind === kind ? 'border-brand-700 bg-white text-brand-900' : 'border-border text-muted-foreground',
              )}
            >
              {kind === 'person' ? 'یک نفر' : 'کل یک واحد'}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr]">
          {targetKind === 'person' ? (
            <label className="flex flex-col gap-1.5 text-sm text-brand-900">
              کد پرسنلی یا نام
              <input
                list="mission-people"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="تایپ کنید و انتخاب کنید"
                className={formFieldClass(false)}
              />
              <datalist id="mission-people">
                {people.data.employees.map((employee) => (
                  <option key={employee.code} value={`${employee.code} — ${employee.name}`} />
                ))}
              </datalist>
            </label>
          ) : (
            <label className="flex flex-col gap-1.5 text-sm text-brand-900">
              واحد / کارگاه
              <select value={target} onChange={(e) => setTarget(e.target.value)} className={formFieldClass(false)}>
                <option value="">انتخاب کنید...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            هفته
            <select value={week} onChange={(e) => setWeek(e.target.value)} className={formFieldClass(false)}>
              {WEEKS.map((n) => (
                <option key={n} value={n}>
                  {faNumber(n)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            امتیاز
            <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} dir="ltr" className={formFieldClass(false)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            توضیح
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="مثلاً ثبت کامل گزارش روزانه"
              className={formFieldClass(false)}
            />
          </label>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="button" variant="brand" onClick={add} disabled={busy || !target.trim() || !points} className="mt-4 h-auto px-5 py-2.5 rounded-md">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} aria-hidden="true" />}
          ثبت امتیاز
        </Button>
      </div>

      <div className="mt-4 max-h-[32rem] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card text-muted-foreground text-xs">
            <tr className="text-right">
              <th className="py-2 px-2 font-medium">گیرنده</th>
              <th className="py-2 px-2 font-medium">هفته</th>
              <th className="py-2 px-2 font-medium">امتیاز</th>
              <th className="py-2 px-2 font-medium">توضیح</th>
              <th className="py-2 px-2 font-medium w-24">
                <span className="sr-only">عملیات</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {missions.data.missions.map((mission) => {
              const isEditing = editing?.id === mission.id;
              return (
                <tr key={mission.id}>
                  <td className="py-2 px-2 text-brand-900 whitespace-nowrap">
                    {mission.teamId ? (
                      <>
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700">واحد</span>{' '}
                        {mission.teamName ?? mission.teamId}
                      </>
                    ) : (
                      <>
                        {mission.employeeName ?? '—'}{' '}
                        <span className="text-xs text-muted-foreground" dir="ltr">
                          {mission.employeeCode}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {isEditing ? (
                      <select
                        value={editing.week}
                        onChange={(e) => setEditing({ ...editing, week: e.target.value })}
                        aria-label="هفته"
                        className={`${formFieldClass(false)} py-1.5`}
                      >
                        {WEEKS.map((n) => (
                          <option key={n} value={n}>
                            {faNumber(n)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      faNumber(mission.week)
                    )}
                  </td>
                  <td className={cn('py-2 px-2 font-bold', mission.points < 0 ? 'text-destructive' : 'text-success')}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editing.points}
                        onChange={(e) => setEditing({ ...editing, points: e.target.value })}
                        aria-label="امتیاز"
                        dir="ltr"
                        className={`${formFieldClass(false)} w-24 py-1.5`}
                      />
                    ) : (
                      faNumber(mission.points)
                    )}
                  </td>
                  <td className="py-2 px-2 text-xs">
                    {isEditing ? (
                      <input
                        value={editing.note}
                        onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                        aria-label="توضیح"
                        className={`${formFieldClass(false)} w-full min-w-40 py-1.5`}
                      />
                    ) : (
                      mission.note
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex justify-end gap-1">
                      {isEditing ? (
                        <>
                          <button type="button" disabled={busy} onClick={saveEdit} className="p-2 text-success" aria-label="ذخیره">
                            <Check size={16} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="p-2 text-muted-foreground" aria-label="انصراف">
                            <X size={16} aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setEditing({ id: mission.id, week: String(mission.week), points: String(mission.points), note: mission.note })
                            }
                            className="p-2 text-muted-foreground hover:text-brand-700"
                            aria-label="ویرایش"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm('این ردیف امتیاز حذف شود؟')) void run(`/api/admin/missions/${mission.id}/delete`, {});
                            }}
                            className="p-2 text-muted-foreground hover:text-destructive"
                            aria-label="حذف"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {missions.data.missions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  هنوز امتیازی ثبت نشده است.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
