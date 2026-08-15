/**
 * Lead form types and API helpers.
 * Material-type keys/labels must stay in sync with workers/leads/src/index.ts.
 */

export const MATERIAL_TYPES = [
  { value: 'machinery', label: 'ماشین‌آلات و تجهیزات' },
  { value: 'asphalt-hot', label: 'آسفالت گرم' },
  { value: 'asphalt-cold', label: 'آسفالت سرد' },
  { value: 'crushed-mountain', label: 'مصالح شکسته کوهی' },
  { value: 'crushed-river', label: 'مصالح رودخانه‌ای' },
  { value: 'gravel-pea', label: 'گراویه و نخودری' },
  { value: 'crushed-sand', label: 'ماسه شکسته' },
  { value: 'other', label: 'سایر' },
] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number]['value'];

export const LEAD_RECIPIENT = 'procurement';

export interface LeadFormData {
  companyName: string;
  contactPerson: string;
  phone: string;
  materialType: MaterialType | '';
  quantity: string;
  message: string;
}

export interface LeadApiResponse {
  ok?: boolean;
  error?: string;
}

export const INITIAL_LEAD_FORM: LeadFormData = {
  companyName: '',
  contactPerson: '',
  phone: '',
  materialType: '',
  quantity: '',
  message: '',
};

export const LEAD_VALIDATION_MESSAGES = {
  companyName: 'نام شرکت الزامی است',
  contactPerson: 'نام مسئول الزامی است',
  phone: 'شماره تماس الزامی است',
  materialType: 'نوع مصالح را انتخاب کنید',
  quantity: 'میزان نیاز را وارد کنید',
} as const;

export const LEAD_SUBMIT_MESSAGES = {
  missingApiUrl: 'آدرس سرویس ارسال پیکربندی نشده است.',
  missingSiteKey: 'کلید امنیتی کپچا پیکربندی نشده است.',
  missingTurnstile: 'لطفاً تأیید امنیتی را تکمیل کنید.',
  genericError: 'ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
  networkError: 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.',
} as const;

export function validateLeadForm(form: LeadFormData): Partial<Record<keyof LeadFormData, string>> {
  const errors: Partial<Record<keyof LeadFormData, string>> = {};
  if (!form.companyName.trim()) errors.companyName = LEAD_VALIDATION_MESSAGES.companyName;
  if (!form.contactPerson.trim()) errors.contactPerson = LEAD_VALIDATION_MESSAGES.contactPerson;
  if (!form.phone.trim()) errors.phone = LEAD_VALIDATION_MESSAGES.phone;
  if (!form.materialType) errors.materialType = LEAD_VALIDATION_MESSAGES.materialType;
  if (!form.quantity.trim()) errors.quantity = LEAD_VALIDATION_MESSAGES.quantity;
  return errors;
}

export async function submitLead(
  form: LeadFormData,
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
      ...form,
      recipient: LEAD_RECIPIENT,
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
