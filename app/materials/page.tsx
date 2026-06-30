'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { materials } from '@/lib/data';
import { CheckCircle, Loader2 } from 'lucide-react';

interface LeadFormData {
  companyName: string;
  contactPerson: string;
  phone: string;
  materialType: string;
  quantity: string;
  message: string;
}

const initialForm: LeadFormData = {
  companyName: '',
  contactPerson: '',
  phone: '',
  materialType: '',
  quantity: '',
  message: '',
};

export default function MaterialsPage() {
  const [form, setForm] = useState<LeadFormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};
    if (!form.companyName.trim()) newErrors.companyName = 'نام شرکت الزامی است';
    if (!form.contactPerson.trim()) newErrors.contactPerson = 'نام مسئول الزامی است';
    if (!form.phone.trim()) newErrors.phone = 'شماره تماس الزامی است';
    if (!form.materialType) newErrors.materialType = 'نوع مصالح را انتخاب کنید';
    if (!form.quantity.trim()) newErrors.quantity = 'میزان نیاز را وارد کنید';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <main>
      <Navbar />

      {/* Page Hero */}
      <section className="relative pt-32 pb-16 bg-brand-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/material-asphalt.png" alt="" fill className="object-cover" aria-hidden="true" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
            تأمین مصالح
          </span>
          <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
            تأمین مصالح صنعتی با کیفیت تضمینی
          </h1>
          <p className="text-brand-100/80 text-lg max-w-2xl mx-auto leading-relaxed">
            آسفالت، بتن و قیر صنعتی با استانداردهای بین‌المللی. تحویل در سرتاسر ایران.
          </p>
        </div>
      </section>

      {/* Materials Cards */}
      <section className="py-16 md:py-24 bg-background" aria-labelledby="materials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="materials-heading" className="sr-only">
            محصولات ما
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {materials.map((mat) => (
              <article key={mat.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={mat.image}
                    alt={mat.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-brand-900 text-xl mb-3">{mat.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{mat.description}</p>
                  <ul className="flex flex-col gap-2">
                    {mat.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-2 text-sm text-brand-800">
                        <CheckCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Lead Form */}
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-brand-900 font-heading font-bold text-2xl mb-2">
                درخواست شما ثبت شد!
              </h3>
              <p className="text-muted-foreground">
                تیم فروش ما در اسرع وقت با شما تماس خواهد گرفت.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm(initialForm); }}
                className="mt-6 px-6 py-2.5 rounded-md bg-brand-800 text-white font-medium hover:bg-brand-700 transition-colors text-sm"
              >
                ارسال درخواست جدید
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-8 border border-border"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company Name */}
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
                    className={`px-4 py-2.5 rounded-md border bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      errors.companyName ? 'border-destructive' : 'border-input'
                    }`}
                    aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                    aria-invalid={!!errors.companyName}
                  />
                  {errors.companyName && (
                    <span id="companyName-error" className="text-xs text-destructive">{errors.companyName}</span>
                  )}
                </div>

                {/* Contact Person */}
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
                    className={`px-4 py-2.5 rounded-md border bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      errors.contactPerson ? 'border-destructive' : 'border-input'
                    }`}
                    aria-describedby={errors.contactPerson ? 'contactPerson-error' : undefined}
                    aria-invalid={!!errors.contactPerson}
                  />
                  {errors.contactPerson && (
                    <span id="contactPerson-error" className="text-xs text-destructive">{errors.contactPerson}</span>
                  )}
                </div>

                {/* Phone */}
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
                    className={`px-4 py-2.5 rounded-md border bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      errors.phone ? 'border-destructive' : 'border-input'
                    }`}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <span id="phone-error" className="text-xs text-destructive">{errors.phone}</span>
                  )}
                </div>

                {/* Material Type */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="materialType" className="text-sm font-medium text-brand-900">
                    نوع مصالح <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="materialType"
                    name="materialType"
                    value={form.materialType}
                    onChange={handleChange}
                    className={`px-4 py-2.5 rounded-md border bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      errors.materialType ? 'border-destructive' : 'border-input'
                    }`}
                    aria-describedby={errors.materialType ? 'materialType-error' : undefined}
                    aria-invalid={!!errors.materialType}
                  >
                    <option value="">انتخاب کنید...</option>
                    <option value="asphalt-hot">آسفالت گرم</option>
                    <option value="asphalt-cold">آسفالت سرد</option>
                    <option value="concrete">بتن آماده</option>
                    <option value="bitumen-60">قیر ۶۰/۷۰</option>
                    <option value="bitumen-80">قیر ۸۰/۱۰۰</option>
                    <option value="bitumen-pmb">قیر پلیمری PMB</option>
                    <option value="emulsion">امولسیون قیری</option>
                    <option value="other">سایر</option>
                  </select>
                  {errors.materialType && (
                    <span id="materialType-error" className="text-xs text-destructive">{errors.materialType}</span>
                  )}
                </div>

                {/* Quantity */}
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
                    className={`px-4 py-2.5 rounded-md border bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      errors.quantity ? 'border-destructive' : 'border-input'
                    }`}
                    aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                    aria-invalid={!!errors.quantity}
                  />
                  {errors.quantity && (
                    <span id="quantity-error" className="text-xs text-destructive">{errors.quantity}</span>
                  )}
                </div>
              </div>

              {/* Message */}
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

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-brand-800 text-white font-bold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  'ارسال درخواست'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
