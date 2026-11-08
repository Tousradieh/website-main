'use client';

import TurnstileWidget from '@/components/TurnstileWidget';
import FormPrivacyNote from '@/components/FormPrivacyNote';
import { Button } from '@/components/ui/button';
import { usePartnershipForm } from '@/hooks/usePartnershipForm';
import { COOPERATION_TYPES } from '@/lib/partnership';
import { formFieldClass } from '@/lib/form-ui';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PartnershipForm() {
  const {
    form,
    submitted,
    loading,
    errors,
    submitError,
    turnstileSiteKey,
    setTurnstileToken,
    handleChange,
    handleSubmit,
    reset,
  } = usePartnershipForm();

  if (submitted) {
    return (
      <div className="bg-card rounded-2xl p-12 border border-border text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-4">
          <CheckCircle className="text-success" size={32} />
        </div>
        <h3 className="text-brand-900 font-heading font-bold text-2xl mb-2">درخواست همکاری شما ثبت شد!</h3>
        <p className="text-muted-foreground">همکاران ما پس از بررسی درخواست با شما تماس می‌گیرند.</p>
        <Button
          type="button"
          variant="brand"
          onClick={reset}
          className="mt-6 h-auto px-6 py-2.5 text-sm rounded-md"
        >
          ثبت درخواست جدید
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl p-8 border border-border"
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contactPerson" className="text-sm font-medium text-brand-900">
            نام و نام خانوادگی <span className="text-destructive">*</span>
          </label>
          <input
            id="contactPerson"
            name="contactPerson"
            type="text"
            value={form.contactPerson}
            onChange={handleChange}
            placeholder="نام کامل"
            className={formFieldClass(!!errors.contactPerson)}
            aria-describedby={errors.contactPerson ? 'contactPerson-error' : undefined}
            aria-invalid={!!errors.contactPerson}
          />
          {errors.contactPerson ? (
            <span id="contactPerson-error" className="text-xs text-destructive">
              {errors.contactPerson}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="companyName" className="text-sm font-medium text-brand-900">
            نام شرکت یا سازمان
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={form.companyName}
            onChange={handleChange}
            placeholder="اختیاری"
            className={formFieldClass(false)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-brand-900">
            شماره تماس <span className="text-destructive">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="۰۹۱۲... یا ۰۵۱..."
            dir="ltr"
            className={formFieldClass(!!errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone}
          />
          {errors.phone ? (
            <span id="phone-error" className="text-xs text-destructive">
              {errors.phone}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cooperationType" className="text-sm font-medium text-brand-900">
            نوع همکاری <span className="text-destructive">*</span>
          </label>
          <select
            id="cooperationType"
            name="cooperationType"
            value={form.cooperationType}
            onChange={handleChange}
            className={formFieldClass(!!errors.cooperationType)}
            aria-describedby={errors.cooperationType ? 'cooperationType-error' : undefined}
            aria-invalid={!!errors.cooperationType}
          >
            <option value="">انتخاب کنید...</option>
            {COOPERATION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.cooperationType ? (
            <span id="cooperationType-error" className="text-xs text-destructive">
              {errors.cooperationType}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-6">
        <label htmlFor="message" className="text-sm font-medium text-brand-900">
          شرح همکاری <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="پروژه، محدوده جغرافیایی، زمان‌بندی و نوع همکاری مدنظر خود را بنویسید..."
          className={`${formFieldClass(!!errors.message)} resize-none`}
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-invalid={!!errors.message}
        />
        {errors.message ? (
          <span id="message-error" className="text-xs text-destructive">
            {errors.message}
          </span>
        ) : null}
      </div>

      {turnstileSiteKey ? (
        <div className="mt-6">
          <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-destructive">تأیید امنیتی در دسترس نیست. لطفاً بعداً تلاش کنید.</p>
      )}

      {submitError ? (
        <p
          role="alert"
          className="mt-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3"
        >
          {submitError}
        </p>
      ) : null}

      <FormPrivacyNote />

      <Button
        type="submit"
        variant="brand"
        disabled={loading}
        className="mt-6 w-full h-auto px-6 py-3.5 rounded-md"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            در حال ارسال...
          </>
        ) : (
          'ثبت درخواست همکاری'
        )}
      </Button>
    </form>
  );
}
