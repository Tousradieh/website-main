/**
 * Cooperation (partnership) form types and API helpers.
 * Cooperation-type keys/labels must stay in sync with workers/leads/src/index.ts.
 */

import { LEAD_SUBMIT_MESSAGES, type LeadApiResponse } from './leads';
import { isIranianPhone } from './phone';

export const COOPERATION_TYPES = [
  {
    value: 'joint-venture',
    label: 'مشارکت در پروژه',
    description: 'مشارکت در پروژه‌های راه، آزادراه و ریلی در قالب کنسرسیوم، EPC یا PPP.',
  },
  {
    value: 'execution',
    label: 'همکاری اجرایی و پیمانکاری',
    description: 'شریک اجرایی یا پیمانکار جزء در پروژه‌های بزرگ زیرساختی خراسان.',
  },
  {
    value: 'supply',
    label: 'تأمین مصالح پروژه',
    description: 'آسفالت، شن و ماسه و بتن آماده از نزدیک‌ترین سایت تولیدی به پروژه شما.',
  },
  {
    value: 'machinery',
    label: 'اجاره ماشین‌آلات',
    description: 'اجاره ماشین‌آلات سنگین راه‌سازی از ناوگان ملکی شرکت.',
  },
  {
    value: 'other',
    label: 'سایر',
    description: '',
  },
] as const;

export type CooperationType = (typeof COOPERATION_TYPES)[number]['value'];

export const PARTNERSHIP_RECIPIENT = 'partnership';

export interface PartnershipFormData {
  contactPerson: string;
  companyName: string;
  phone: string;
  cooperationType: CooperationType | '';
  message: string;
}

export const INITIAL_PARTNERSHIP_FORM: PartnershipFormData = {
  contactPerson: '',
  companyName: '',
  phone: '',
  cooperationType: '',
  message: '',
};

export const PARTNERSHIP_VALIDATION_MESSAGES = {
  contactPerson: 'نام الزامی است',
  phoneRequired: 'شماره تماس الزامی است',
  phoneInvalid: 'شماره تماس معتبر نیست',
  cooperationType: 'نوع همکاری را انتخاب کنید',
  message: 'شرح همکاری الزامی است',
} as const;

export function validatePartnershipForm(
  form: PartnershipFormData,
): Partial<Record<keyof PartnershipFormData, string>> {
  const errors: Partial<Record<keyof PartnershipFormData, string>> = {};
  if (!form.contactPerson.trim()) {
    errors.contactPerson = PARTNERSHIP_VALIDATION_MESSAGES.contactPerson;
  }
  if (!form.phone.trim()) {
    errors.phone = PARTNERSHIP_VALIDATION_MESSAGES.phoneRequired;
  } else if (!isIranianPhone(form.phone)) {
    errors.phone = PARTNERSHIP_VALIDATION_MESSAGES.phoneInvalid;
  }
  if (!form.cooperationType) {
    errors.cooperationType = PARTNERSHIP_VALIDATION_MESSAGES.cooperationType;
  }
  if (!form.message.trim()) errors.message = PARTNERSHIP_VALIDATION_MESSAGES.message;
  return errors;
}

export async function submitPartnership(
  form: PartnershipFormData,
  turnstileToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_LEADS_API_URL?.trim();
  if (!apiUrl) {
    return { ok: false, error: LEAD_SUBMIT_MESSAGES.missingApiUrl };
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contactPerson: form.contactPerson,
      companyName: form.companyName,
      phone: form.phone,
      cooperationType: form.cooperationType,
      message: form.message,
      recipient: PARTNERSHIP_RECIPIENT,
      turnstileToken,
      'cf-turnstile-response': turnstileToken,
    }),
  });

  const data = (await res.json().catch(() => null)) as LeadApiResponse | null;
  if (!res.ok || !data?.ok) {
    return {
      ok: false,
      error: data?.error ?? LEAD_SUBMIT_MESSAGES.genericError,
    };
  }

  return { ok: true };
}
