'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formFieldClass } from '@/lib/form-ui';
import { useStoredToken } from '@/hooks/useStoredToken';
import {
  activityKind,
  adminToken,
  audienceLabel,
  DEPARTMENTS,
  improvementCategoryLabel,
  faNumber,
  hammasirApi,
  type AdminOverview,
  type ApiResult,
} from '@/lib/hammasir';
import ActivityForm from './ActivityForm';
import CapstoneReview from './CapstoneReview';
import ClaimReview from './ClaimReview';
import AdminPeople from './AdminPeople';
import AdminStore from './AdminStore';
import ImportBox from './ImportBox';
import ImprovementReview from './ImprovementReview';
import QuizForm from './QuizForm';

function fetchOverview(token: string) {
  return hammasirApi<AdminOverview>('/api/admin/overview', { token });
}

export default function AdminPanel() {
  const token = useStoredToken(adminToken);
  const [password, setPassword] = useState('');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = useCallback((value: string, result: ApiResult<AdminOverview>) => {
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      if (result.status === 401) adminToken.set(null);
      return;
    }
    setError(null);
    setOverview(result);
    adminToken.set(value);
  }, []);

  // Restore a session saved earlier in this tab.
  useEffect(() => {
    if (!token || overview) return;
    let active = true;
    void fetchOverview(token).then((result) => {
      if (active) apply(token, result);
    });
    return () => {
      active = false;
    };
  }, [token, overview, apply]);

  const load = (value: string) => {
    setLoading(true);
    void fetchOverview(value).then((result) => apply(value, result));
  };

  const refresh = () => {
    if (token) load(token);
  };

  const signOut = () => {
    adminToken.set(null);
    setOverview(null);
  };

  const deleteQuiz = async (id: number, title: string) => {
    if (!token || !window.confirm(`کوییز «${title}» و همه پاسخ‌ها و امتیازهای آن حذف شود؟`)) return;
    const result = await hammasirApi(`/api/admin/quizzes/${id}/delete`, { token, body: {} });
    if (!result.ok) setError(result.error);
    refresh();
  };

  const deleteActivity = async (id: number, title: string) => {
    if (!token || !window.confirm(`«${title}» و همه تأییدها و امتیازهای آن حذف شود؟`)) return;
    const result = await hammasirApi(`/api/admin/activities/${id}/delete`, { token, body: {} });
    if (!result.ok) setError(result.error);
    refresh();
  };

  if (token === undefined) return null;

  if (!token || !overview) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (password.trim()) load(password.trim());
    };
    return (
      <form onSubmit={submit} className="max-w-md mx-auto bg-card rounded-2xl p-6 sm:p-8 border border-border">
        <label htmlFor="admin-password" className="text-sm font-medium text-brand-900">
          رمز مدیریت
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
          className={`${formFieldClass(false)} w-full mt-1.5`}
        />
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="brand" disabled={loading} className="mt-6 w-full h-auto px-6 py-3 rounded-md">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'ورود'}
        </Button>
      </form>
    );
  }

  const {
    counts,
    campaign,
    teams,
    units,
    quizzes,
    activities,
    pendingClaims,
    pendingCapstones,
    pendingImprovements,
    topImprovements,
    rewards,
    pendingRedemptions,
    tracks,
  } = overview;
  const stats = [
    { label: 'پرسنل ثبت‌شده', value: counts.employees },
    { label: 'پرسنل فعال', value: counts.active },
    { label: 'مدیران و سرپرستان', value: counts.managers },
    { label: 'پروفایل تکمیل‌شده', value: counts.profiles },
    { label: 'آزمون‌های پاسخ‌داده‌شده', value: counts.attempts },
    { label: 'هفته کمپین', value: campaign.week },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={signOut} className="h-auto px-4 py-2 rounded-md">
          <LogOut size={16} aria-hidden="true" />
          خروج
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">
          {error}
        </p>
      ) : null}

      <dl className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-4">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="font-heading font-black text-2xl text-brand-900 mt-1">{faNumber(stat.value)}</dd>
          </div>
        ))}
      </dl>

      {counts.noDepartment > 0 ? (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-brand-900">
          برای {faNumber(counts.noDepartment)} نفر حوزه کاری ثبت نشده است و مسیر تخصصی آن‌ها نمایش داده نمی‌شود. ستون
          پنجم فایل پرسنل را کامل کنید.
        </p>
      ) : null}

      <ImprovementReview token={token} projects={pendingImprovements} onReviewed={refresh} />

      {topImprovements.length ? (
        <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-top-improvements">
          <h2 id="admin-top-improvements" className="font-heading font-bold text-brand-900 text-lg mb-3">
            رتبه‌بندی پروژه‌های بهبود (۱۲ پروژه برتر جایزه می‌گیرند)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">رتبه</th>
                  <th className="py-2 px-2 font-medium">پروژه</th>
                  <th className="py-2 px-2 font-medium">فرد و واحد</th>
                  <th className="py-2 px-2 font-medium">سهولت</th>
                  <th className="py-2 px-2 font-medium">اثر</th>
                  <th className="py-2 px-2 font-medium">امتیاز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topImprovements.map((project, i) => (
                  <tr key={project.id} className={i < 12 ? 'bg-gold/5' : ''}>
                    <td className="py-2 px-2">{faNumber(i + 1)}</td>
                    <td className="py-2 px-2 text-brand-900">
                      {project.title}
                      <span className="block text-xs text-muted-foreground">{improvementCategoryLabel(project.category)}</span>
                    </td>
                    <td className="py-2 px-2 text-xs">
                      {project.employeeName} · {project.teamName}
                    </td>
                    <td className="py-2 px-2">{faNumber(project.ease)}</td>
                    <td className="py-2 px-2">{faNumber(project.impact)}</td>
                    <td className="py-2 px-2 font-bold">{faNumber(project.points)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <CapstoneReview token={token} capstones={pendingCapstones} onReviewed={refresh} />

      <ClaimReview token={token} claims={pendingClaims} onReviewed={refresh} />

      <AdminStore token={token} rewards={rewards} pending={pendingRedemptions} onChanged={refresh} />

      <AdminPeople token={token} />

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-tracks">
        <h2 id="admin-tracks" className="font-heading font-bold text-brand-900 text-lg mb-4">
          مسیرهای آموزشی
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">مسیر</th>
                <th className="py-2 px-2 font-medium">مخاطب</th>
                <th className="py-2 px-2 font-medium">شروع‌کرده</th>
                <th className="py-2 px-2 font-medium">تکمیل‌کرده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tracks.map((track) => (
                <tr key={track.id}>
                  <td className="py-2 px-2 text-brand-900">{track.title}</td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    {audienceLabel(track.audience)}
                  </td>
                  <td className="py-2 px-2">{faNumber(track.started)}</td>
                  <td className="py-2 px-2">{faNumber(track.completed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-league">
        <h2 id="admin-league" className="font-heading font-bold text-brand-900 text-lg mb-4">
          واحدها و لیگ
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">شناسه</th>
                <th className="py-2 px-2 font-medium">نام</th>
                <th className="py-2 px-2 font-medium">نفرات</th>
                <th className="py-2 px-2 font-medium">رتبه</th>
                <th className="py-2 px-2 font-medium">امتیاز</th>
                <th className="py-2 px-2 font-medium">مشارکت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {units.map((unit) => {
                const standing = teams.find((team) => team.id === unit.id);
                return (
                  <tr key={unit.id}>
                    <td className="py-2 px-2" dir="ltr">
                      {unit.id}
                    </td>
                    <td className="py-2 px-2 text-brand-900">{unit.name}</td>
                    <td className="py-2 px-2">{faNumber(unit.members)}</td>
                    <td className="py-2 px-2">{standing ? faNumber(standing.rank) : '—'}</td>
                    <td className="py-2 px-2">{standing ? faNumber(standing.score) : '—'}</td>
                    <td className="py-2 px-2">{standing ? `٪${faNumber(standing.participation)}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <ImportBox
          token={token}
          endpoint="/api/admin/teams"
          title="واحدها و کارگاه‌ها"
          columns="شناسه (انگلیسی)، نام"
          example={'golbahar,مجتمع گلبهار\ntechnical-office,دفتر فنی ستاد'}
          onImported={refresh}
        />
        <ImportBox
          token={token}
          endpoint="/api/admin/employees"
          title="پرسنل"
          columns={`کد پرسنلی، نام، شناسه واحد/کارگاه، رمز ۶ تا ۸ رقمی (خالی = رمز قبلی بماند)، واحد سازمانی: ${DEPARTMENTS.map((d) => `${d.value} (${d.label})`).join('، ')}، ستون ششم «مدیر» برای مدیران و سرپرستان`}
          example={'1001,علی رضایی,golbahar,482193,plants\n1002,مریم احمدی,hq-finance,739051,finance,مدیر'}
          onImported={refresh}
        />
        <ImportBox
          token={token}
          endpoint="/api/admin/missions"
          title="امتیاز ماموریت‌ها"
          columns="کد پرسنلی یا team:شناسه‌واحد، هفته، امتیاز (منفی برای اصلاح)، توضیح"
          example={'1001,2,40,ثبت کامل گزارش روزانه کارگاه\nteam:golbahar,2,25,ثبت ۱۰۰٪ داده GPS'}
          onImported={refresh}
        />
      </div>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-activities">
        <h2 id="admin-activities" className="font-heading font-bold text-brand-900 text-lg mb-4">
          دوره‌ها و کلاس‌ها
        </h2>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-6">هنوز دوره یا کلاسی ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-border mb-6">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-brand-900">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activityKind(activity.kind).label} · هفته {faNumber(activity.week)} ·{' '}
                    {faNumber(activity.points)} رادکوین · {faNumber(activity.approved)} نفر تأییدشده
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteActivity(activity.id, activity.title)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  aria-label={`حذف ${activity.title}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <ActivityForm token={token} onAdded={refresh} />
      </section>

      <section className="bg-card rounded-2xl border border-border p-5 sm:p-6" aria-labelledby="admin-quizzes">
        <h2 id="admin-quizzes" className="font-heading font-bold text-brand-900 text-lg mb-4">
          کوییزها
        </h2>
        {quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز کوییزی ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-border mb-6">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-brand-900">{quiz.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    هفته {faNumber(quiz.week)} · {faNumber(quiz.questionCount)} سؤال · {faNumber(quiz.points)}{' '}
                    رادکوین · {faNumber(quiz.attempts)} شرکت‌کننده
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteQuiz(quiz.id, quiz.title)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  aria-label={`حذف کوییز ${quiz.title}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <QuizForm token={token} onAdded={refresh} />
      </section>
    </div>
  );
}
