'use client';

import { useState } from 'react';
import { KeyRound, Loader2, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHammasirData } from '@/hooks/useHammasirData';
import { formFieldClass } from '@/lib/form-ui';
import {
  DEPARTMENTS,
  departmentLabel,
  faNumber,
  hammasirApi,
  type AdminEmployee,
  type AdminOverview,
} from '@/lib/hammasir';
import PanelState from './PanelState';
import PinNotice from './PinNotice';

interface AdminPersonnelProps {
  token: string;
  units: AdminOverview['units'];
  onChanged: () => void;
  onSessionExpired: () => void;
}

interface Draft {
  create: boolean;
  code: string;
  name: string;
  teamId: string;
  department: string;
  isManager: boolean;
  pin: string;
}

const EMPTY: Draft = { create: true, code: '', name: '', teamId: '', department: '', isManager: false, pin: '' };

/** Personnel table: search, add, edit, new PIN (shown once), delete. */
export default function AdminPersonnel({ token, units, onChanged, onSessionExpired }: AdminPersonnelProps) {
  const { data, error, reload } = useHammasirData<{ employees: AdminEmployee[] }>(
    '/api/admin/employees',
    token,
    onSessionExpired,
  );
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pinShown, setPinShown] = useState<{ code: string; name: string; pin: string } | null>(null);

  if (!data) return <PanelState error={error} onRetry={reload} />;

  const refresh = () => {
    reload();
    onChanged();
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const result = await hammasirApi<{ pin?: string }>('/api/admin/employees/save', { token, body: draft });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    if (result.pin) setPinShown({ code: draft.code, name: draft.name, pin: result.pin });
    setDraft(EMPTY);
    refresh();
  };

  const newPin = async (employee: AdminEmployee) => {
    if (!window.confirm(`برای «${employee.name}» رمز جدید ساخته شود؟ رمز قبلی باطل و فرد از همه دستگاه‌ها خارج می‌شود.`)) return;
    setBusy(true);
    setMessage(null);
    const result = await hammasirApi<{ pin: string }>(`/api/admin/employees/${employee.code}/pin`, { token, body: {} });
    setBusy(false);
    if (!result.ok) setMessage(result.error);
    else setPinShown({ code: employee.code, name: employee.name, pin: result.pin });
    reload();
  };

  const remove = async (employee: AdminEmployee) => {
    if (
      !window.confirm(
        `«${employee.name}» و همه امتیازها، پاسخ‌ها و پروژه‌هایش برای همیشه حذف شود؟ این کار برگشت‌پذیر نیست.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await hammasirApi(`/api/admin/employees/${employee.code}/delete`, { token, body: {} });
    setBusy(false);
    if (!result.ok) setMessage(result.error);
    refresh();
  };

  const edit = (employee: AdminEmployee) => {
    setDraft({
      create: false,
      code: employee.code,
      name: employee.name,
      teamId: employee.teamId,
      department: employee.department ?? '',
      isManager: employee.isManager === 1,
      pin: '',
    });
    setMessage(null);
  };

  const q = query.trim().toLowerCase();
  const rows = data.employees.filter(
    (employee) =>
      (!teamFilter || employee.teamId === teamFilter) &&
      (!q || employee.name.toLowerCase().includes(q) || employee.code.toLowerCase().includes(q)),
  );

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-personnel">
      <h2 id="admin-personnel" className="font-heading font-bold text-brand-900 text-lg">
        پرسنل <span className="text-sm font-normal text-muted-foreground">({faNumber(data.employees.length)} نفر)</span>
      </h2>

      {pinShown ? (
        <div className="mt-4">
          <PinNotice {...pinShown} onClose={() => setPinShown(null)} />
        </div>
      ) : null}

      <div className="mt-4 rounded-xl bg-brand-50 p-4">
        <h3 className="text-sm font-bold text-brand-900">
          {draft.create ? 'افزودن نفر جدید' : `ویرایش ${draft.name} (کد ${draft.code})`}
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            کد پرسنلی
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              disabled={!draft.create}
              dir="ltr"
              className={formFieldClass(false)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            نام و نام خانوادگی
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={formFieldClass(false)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            واحد / کارگاه
            <select value={draft.teamId} onChange={(e) => setDraft({ ...draft, teamId: e.target.value })} className={formFieldClass(false)}>
              <option value="">انتخاب کنید...</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-brand-900">
            واحد سازمانی (مسیر آموزشی)
            <select
              value={draft.department}
              onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              className={formFieldClass(false)}
            >
              <option value="">تعیین نشده (فقط مسیرهای مشترک)</option>
              {DEPARTMENTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {draft.create ? (
            <label className="flex flex-col gap-1.5 text-sm text-brand-900">
              رمز (خالی = ساخت خودکار ۶ رقمی)
              <input
                value={draft.pin}
                onChange={(e) => setDraft({ ...draft, pin: e.target.value })}
                inputMode="numeric"
                dir="ltr"
                className={formFieldClass(false)}
              />
            </label>
          ) : null}
          <label className="flex items-center gap-2 self-end py-2.5 text-sm text-brand-900">
            <input
              type="checkbox"
              checked={draft.isManager}
              onChange={(e) => setDraft({ ...draft, isManager: e.target.checked })}
              className="size-4 accent-brand-700"
            />
            مدیر یا سرپرست (دسترسی «تیم من»)
          </label>
        </div>
        {message ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {message}
          </p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="brand"
            onClick={save}
            disabled={busy || !draft.code.trim() || !draft.name.trim() || !draft.teamId}
            className="h-auto px-5 py-2.5 rounded-md"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : draft.create ? <Plus size={16} aria-hidden="true" /> : null}
            {draft.create ? 'افزودن و ساخت رمز' : 'ذخیره تغییرات'}
          </Button>
          {!draft.create ? (
            <Button type="button" variant="outline" onClick={() => setDraft(EMPTY)} className="h-auto px-5 py-2.5 rounded-md">
              انصراف
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو با نام یا کد"
            aria-label="جستجوی پرسنل"
            className={`${formFieldClass(false)} w-full pr-9`}
          />
        </div>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} aria-label="فیلتر واحد" className={formFieldClass(false)}>
          <option value="">همه واحدها</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 max-h-[32rem] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card text-muted-foreground text-xs">
            <tr className="text-right">
              <th className="py-2 px-2 font-medium">کد</th>
              <th className="py-2 px-2 font-medium">نام</th>
              <th className="py-2 px-2 font-medium">واحد / کارگاه</th>
              <th className="py-2 px-2 font-medium">واحد سازمانی</th>
              <th className="py-2 px-2 font-medium w-28">
                <span className="sr-only">عملیات</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((employee) => (
              <tr key={employee.code} className={draft.code === employee.code && !draft.create ? 'bg-brand-50' : ''}>
                <td className="py-2 px-2 text-xs" dir="ltr">
                  {employee.code}
                </td>
                <td className="py-2 px-2 text-brand-900">
                  <span className="whitespace-nowrap">{employee.name}</span>
                  {employee.isManager ? (
                    <span className="mr-1 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] text-brand-900">مدیر</span>
                  ) : null}
                  {employee.locked ? (
                    <span className="mr-1 inline-flex items-center gap-0.5 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
                      <Lock size={10} aria-hidden="true" />
                      قفل
                    </span>
                  ) : null}
                  {employee.jobTitle ? <span className="block text-xs text-muted-foreground">{employee.jobTitle}</span> : null}
                </td>
                <td className="py-2 px-2 text-xs whitespace-nowrap">{employee.teamName}</td>
                <td className="py-2 px-2 text-xs">{departmentLabel(employee.department)}</td>
                <td className="py-2 px-2">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => edit(employee)} className="p-2 text-muted-foreground hover:text-brand-700" aria-label={`ویرایش ${employee.name}`}>
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => newPin(employee)}
                      className="p-2 text-muted-foreground hover:text-brand-700"
                      aria-label={`رمز جدید برای ${employee.name}`}
                      title="رمز جدید (قفل را هم باز می‌کند)"
                    >
                      <KeyRound size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(employee)}
                      className="p-2 text-muted-foreground hover:text-destructive"
                      aria-label={`حذف ${employee.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  کسی پیدا نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
