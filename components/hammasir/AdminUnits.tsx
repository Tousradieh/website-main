'use client';

import { useState } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { faNumber, hammasirApi, type AdminOverview } from '@/lib/hammasir';

interface AdminUnitsProps {
  token: string;
  units: AdminOverview['units'];
  onChanged: () => void;
}

/** Units / sites table: add, rename, delete (only when empty). */
export default function AdminUnits({ token, units, onChanged }: AdminUnitsProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (path: string, body: unknown) => {
    setBusy(true);
    setError(null);
    const result = await hammasirApi(path, { token, body });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    onChanged();
    return true;
  };

  const add = async () => {
    if (await run('/api/admin/teams/save', { id: newId.trim().toLowerCase(), name: newName })) {
      setNewId('');
      setNewName('');
    }
  };

  const save = async (id: string) => {
    if (await run('/api/admin/teams/save', { id, name: draftName })) setEditing(null);
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-units">
      <h2 id="admin-units" className="font-heading font-bold text-brand-900 text-lg">
        واحدها و کارگاه‌ها
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        هر واحد یا کارگاه یک تیم در لیگ است. شناسه بعد از ساخت قابل تغییر نیست؛ نام قابل ویرایش است.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <input
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="شناسه انگلیسی، مثلاً golbahar"
          dir="ltr"
          aria-label="شناسه واحد جدید"
          className={formFieldClass(false)}
        />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="نام، مثلاً مجتمع گلبهار"
          aria-label="نام واحد جدید"
          className={formFieldClass(false)}
        />
        <Button type="button" variant="brand" onClick={add} disabled={busy || !newId.trim() || !newName.trim()} className="h-auto px-4 py-2.5 rounded-md">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} aria-hidden="true" />}
          افزودن
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-xs">
            <tr className="text-right">
              <th className="py-2 px-2 font-medium">شناسه</th>
              <th className="py-2 px-2 font-medium">نام</th>
              <th className="py-2 px-2 font-medium">نفرات</th>
              <th className="py-2 px-2 font-medium w-24">
                <span className="sr-only">عملیات</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {units.map((unit) => (
              <tr key={unit.id}>
                <td className="py-2 px-2 text-xs" dir="ltr">
                  {unit.id}
                </td>
                <td className="py-2 px-2 text-brand-900">
                  {editing === unit.id ? (
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      aria-label={`نام جدید ${unit.id}`}
                      className={`${formFieldClass(false)} w-full py-1.5`}
                      autoFocus
                    />
                  ) : (
                    unit.name
                  )}
                </td>
                <td className="py-2 px-2">{faNumber(unit.members)}</td>
                <td className="py-2 px-2">
                  <div className="flex justify-end gap-1">
                    {editing === unit.id ? (
                      <>
                        <button type="button" disabled={busy} onClick={() => save(unit.id)} className="p-2 text-success" aria-label="ذخیره">
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
                          onClick={() => {
                            setEditing(unit.id);
                            setDraftName(unit.name);
                          }}
                          className="p-2 text-muted-foreground hover:text-brand-700"
                          aria-label={`ویرایش ${unit.name}`}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={busy || unit.members > 0}
                          title={unit.members > 0 ? 'واحد دارای عضو قابل حذف نیست' : undefined}
                          onClick={() => {
                            if (window.confirm(`واحد «${unit.name}» حذف شود؟`)) void run(`/api/admin/teams/${unit.id}/delete`, {});
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
                          aria-label={`حذف ${unit.name}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
