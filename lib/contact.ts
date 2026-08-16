import { LEAD_SUBMIT_MESSAGES, type LeadApiResponse } from './leads';
import { isIranianPhone } from './phone';

export const CONTACT_TOPICS = [
  { value: 'project', label: 'استعلام پروژه' },
  { value: 'tender', label: 'مناقصه و همکاری' },
  { value: 'materials', label: 'خرید مصالح' },
  { value: 'other', label: 'سایر' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value'];

export const CONTACT_RECIPIENT = 'sales';

export interface ContactFormData {
  contactPerson: string;
  companyName: string;
  phone: string;
  topic: ContactTopic | '';
  message: string;
}

export const INITIAL_CONTACT_FORM: ContactFormData = {
  contactPerson: '',
  companyName: '',
  phone: '',
  topic: '',
  message: '',
};

export const CONTACT_VALIDATION_MESSAGES = {
  contactPerson: 'نام الزامی است',
  phoneRequired: 'شماره تماس الزامی است',
  phoneInvalid: 'شماره تماس معتبر نیست',
  topic: 'موضوع را انتخاب کنید',
  message: 'متن پیام الزامی است',
} as const;

export function validateContactForm(
  form: ContactFormData,
): Partial<Record<keyof ContactFormData, string>> {
  const errors: Partial<Record<keyof ContactFormData, string>> = {};
  if (!form.contactPerson.trim()) {
    errors.contactPerson = CONTACT_VALIDATION_MESSAGES.contactPerson;
  }
  if (!form.phone.trim()) {
    errors.phone = CONTACT_VALIDATION_MESSAGES.phoneRequired;
  } else if (!isIranianPhone(form.phone)) {
    errors.phone = CONTACT_VALIDATION_MESSAGES.phoneInvalid;
  }
  if (!form.topic) errors.topic = CONTACT_VALIDATION_MESSAGES.topic;
  if (!form.message.trim()) errors.message = CONTACT_VALIDATION_MESSAGES.message;
  return errors;
}

export async function submitContact(
  form: ContactFormData,
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
      topic: form.topic,
      message: form.message,
      recipient: CONTACT_RECIPIENT,
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
