'use client';

// Materials (B2B) request form — temporarily disabled: not rendered on any page.
// The /cooperation form (PartnershipForm) replaces it for now; re-enable by rendering it again.

import TurnstileWidget from '@/components/TurnstileWidget';
import FormPrivacyNote from '@/components/FormPrivacyNote';
import { Button } from '@/components/ui/button';
import { useLeadForm } from '@/hooks/useLeadForm';
import { MATERIAL_TYPES } from '@/lib/leads';
import { formFieldClass } from '@/lib/form-ui';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function LeadInquiryForm() {
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
  } = useLeadForm();

  return (
    <section className="py-16 md:py-24 bg-brand-50" aria-labelledby="form-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
            سفارش عمده
          </span>
          <h2
            id="form-heading"
            className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
          >
            فرم درخواست مصالح B2B
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            فرم زیر را تکمیل کنید؛ کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس می‌گیرند.
          </p>
        </div>

        {submitted ? (
          <div className="bg-card rounded-2xl p-12 border border-border text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-4">
              <CheckCircle className="text-success" size={32} />
            </div>
            <h3 className="text-brand-900 font-heading font-bold text-2xl mb-2">
              درخواست شما ثبت شد!
            </h3>
            <p className="text-muted-foreground">
              تیم فروش ما در اسرع وقت با شما تماس خواهد گرفت.
            </p>
            <Button
              type="button"
              variant="brand"
              onClick={reset}
              className="mt-6 h-auto px-6 py-2.5 text-sm rounded-md"
            >
              ارسال درخواست جدید
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 border border-border"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="companyName" className="text-sm font-medium text-brand-900">
                  نام شرکت <span className="text-destructive">*</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="شرکت مهندسی ..."
                  className={formFieldClass(!!errors.companyName)}
                  aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName ? (
                  <span id="companyName-error" className="text-xs text-destructive">
                    {errors.companyName}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contactPerson" className="text-sm font-medium text-brand-900">
                  نام مسئول خرید <span className="text-destructive">*</span>
                </label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="نام و نام خانوادگی"
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
                <label htmlFor="phone" className="text-sm font-medium text-brand-900">
                  شماره تماس <span className="text-destructive">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="۰۹۱۲..."
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
                <label htmlFor="materialType" className="text-sm font-medium text-brand-900">
                  نوع مصالح <span className="text-destructive">*</span>
                </label>
                <select
                  id="materialType"
                  name="materialType"
                  value={form.materialType}
                  onChange={handleChange}
                  className={formFieldClass(!!errors.materialType)}
                  aria-describedby={errors.materialType ? 'materialType-error' : undefined}
                  aria-invalid={!!errors.materialType}
                >
                  <option value="">انتخاب کنید...</option>
                  {MATERIAL_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.materialType ? (
                  <span id="materialType-error" className="text-xs text-destructive">
                    {errors.materialType}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="quantity" className="text-sm font-medium text-brand-900">
                  میزان نیاز (تن / متر مکعب) <span className="text-destructive">*</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="مثال: ۵۰۰ تن"
                  className={formFieldClass(!!errors.quantity)}
                  aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                  aria-invalid={!!errors.quantity}
                />
                {errors.quantity ? (
                  <span id="quantity-error" className="text-xs text-destructive">
                    {errors.quantity}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-6">
              <label htmlFor="message" className="text-sm font-medium text-brand-900">
                توضیحات تکمیلی
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="محل تحویل، زمان‌بندی، مشخصات فنی خاص و..."
                className="px-4 py-2.5 rounded-md border border-input bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            {turnstileSiteKey ? (
              <div className="mt-6">
                <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
              </div>
            ) : (
              <p className="mt-6 text-sm text-destructive">
                تأیید امنیتی در دسترس نیست. لطفاً بعداً تلاش کنید.
              </p>
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
                'ارسال درخواست'
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
