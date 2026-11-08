interface Env {
  BALE_BOT_TOKEN: string;
  BALE_PROCUREMENT_CHAT_ID: string;
  BALE_SALES_CHAT_ID?: string;
  BALE_PARTNERSHIP_CHAT_ID?: string;
  TURNSTILE_SECRET: string;
  ALLOWED_ORIGIN?: string;
}

interface LeadBody {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  materialType?: string;
  quantity?: string;
  topic?: string;
  cooperationType?: string;
  message?: string;
  recipient?: string;
  turnstileToken?: string;
  'cf-turnstile-response'?: string;
}

const BALE_API_BASE = 'https://tapi.bale.ai';
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type Recipient = 'procurement' | 'sales' | 'partnership';

/** Keep keys/labels in sync with website-main/lib/leads.ts MATERIAL_TYPES */
type MaterialType =
  | 'machinery'
  | 'asphalt-hot'
  | 'asphalt-cold'
  | 'crushed-mountain'
  | 'crushed-river'
  | 'gravel-pea'
  | 'crushed-sand'
  | 'other';

const materialTypeLabels: Record<MaterialType, string> = {
  machinery: 'ماشین‌آلات و تجهیزات',
  'asphalt-hot': 'آسفالت گرم',
  'asphalt-cold': 'آسفالت سرد',
  'crushed-mountain': 'مصالح شکسته کوهی',
  'crushed-river': 'مصالح رودخانه‌ای',
  'gravel-pea': 'گراویه و نخودری',
  'crushed-sand': 'ماسه شکسته',
  other: 'سایر',
};

/** Keep keys/labels in sync with website-main/lib/contact.ts CONTACT_TOPICS */
type ContactTopic = 'project' | 'tender' | 'materials' | 'other';

const contactTopicLabels: Record<ContactTopic, string> = {
  project: 'استعلام پروژه',
  tender: 'مناقصه و همکاری',
  materials: 'خرید مصالح',
  other: 'سایر',
};

/** Keep keys/labels in sync with website-main/lib/partnership.ts COOPERATION_TYPES */
type CooperationType = 'joint-venture' | 'execution' | 'supply' | 'machinery' | 'other';

const cooperationTypeLabels: Record<CooperationType, string> = {
  'joint-venture': 'مشارکت در پروژه',
  execution: 'همکاری اجرایی و پیمانکاری',
  supply: 'تأمین مصالح پروژه',
  machinery: 'اجاره ماشین‌آلات',
  other: 'سایر',
};

function corsHeaders(env: Env, request: Request): HeadersInit {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = env.ALLOWED_ORIGIN?.trim();
  const allowOrigin =
    allowed && allowed !== '*'
      ? origin === allowed
        ? allowed
        : 'null'
      : '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env: Env, request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(env, request),
    },
  });
}

/** Keep in sync with website-main/lib/phone.ts */
function isIranianPhone(value: string): boolean {
  let digits = value.replace(/[^\d+]/g, '');
  digits = digits.replace(/^(?:\+|00)/, '');
  if (digits.startsWith('98')) {
    digits = digits.slice(2);
  }
  if (!digits.startsWith('0')) {
    digits = `0${digits}`;
  }
  return /^0\d{10}$/.test(digits);
}

function validatePhone(phone: string | undefined): string | null {
  if (!phone?.trim()) return 'شماره تماس الزامی است';
  if (!isIranianPhone(phone)) return 'شماره تماس معتبر نیست';
  return null;
}

function validateProcurement(body: LeadBody): string | null {
  if (!body.companyName?.trim()) return 'نام شرکت الزامی است';
  if (!body.contactPerson?.trim()) return 'نام مسئول الزامی است';
  const phoneError = validatePhone(body.phone);
  if (phoneError) return phoneError;
  if (!body.materialType?.trim()) return 'نوع مصالح الزامی است';
  if (!body.quantity?.trim()) return 'میزان نیاز الزامی است';
  return null;
}

function validateSales(body: LeadBody): string | null {
  if (!body.contactPerson?.trim()) return 'نام الزامی است';
  const phoneError = validatePhone(body.phone);
  if (phoneError) return phoneError;
  if (!body.topic?.trim()) return 'موضوع الزامی است';
  if (!body.message?.trim()) return 'متن پیام الزامی است';
  return null;
}

function validatePartnership(body: LeadBody): string | null {
  if (!body.contactPerson?.trim()) return 'نام الزامی است';
  const phoneError = validatePhone(body.phone);
  if (phoneError) return phoneError;
  if (!body.cooperationType?.trim()) return 'نوع همکاری الزامی است';
  if (!body.message?.trim()) return 'شرح همکاری الزامی است';
  return null;
}

function formatProcurementMessage(
  lead: Required<
    Pick<
      LeadBody,
      'companyName' | 'contactPerson' | 'phone' | 'materialType' | 'quantity'
    >
  > & { message?: string }
): string {
  const materialKey = lead.materialType as MaterialType;
  const material = materialTypeLabels[materialKey] ?? lead.materialType;

  const lines = [
    '📦 درخواست جدید تأمین مصالح',
    '',
    `شرکت: ${lead.companyName}`,
    `مسئول: ${lead.contactPerson}`,
    `تلفن: ${lead.phone}`,
    `نوع مصالح: ${material}`,
    `میزان نیاز: ${lead.quantity}`,
  ];

  const message = lead.message?.trim();
  if (message) {
    lines.push('', `توضیحات: ${message}`);
  }

  return lines.join('\n');
}

function formatSalesMessage(
  lead: Required<Pick<LeadBody, 'contactPerson' | 'phone' | 'topic' | 'message'>> & {
    companyName?: string;
  }
): string {
  const topicKey = lead.topic as ContactTopic;
  const topic = contactTopicLabels[topicKey] ?? lead.topic;
  const company = lead.companyName?.trim();

  const lines = [
    '📩 پیام جدید از صفحه تماس',
    '',
    `نام: ${lead.contactPerson}`,
  ];

  if (company) {
    lines.push(`شرکت: ${company}`);
  }

  lines.push(`تلفن: ${lead.phone}`, `موضوع: ${topic}`, '', `پیام: ${lead.message}`);

  return lines.join('\n');
}

function formatPartnershipMessage(
  lead: Required<Pick<LeadBody, 'contactPerson' | 'phone' | 'cooperationType' | 'message'>> & {
    companyName?: string;
  }
): string {
  const typeKey = lead.cooperationType as CooperationType;
  const cooperationType = cooperationTypeLabels[typeKey] ?? lead.cooperationType;
  const company = lead.companyName?.trim();

  const lines = [
    '🤝 درخواست جدید همکاری',
    '',
    `نام: ${lead.contactPerson}`,
  ];

  if (company) {
    lines.push(`شرکت / سازمان: ${company}`);
  }

  lines.push(
    `تلفن: ${lead.phone}`,
    `نوع همکاری: ${cooperationType}`,
    '',
    `شرح: ${lead.message}`
  );

  return lines.join('\n');
}

function clientIp(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;
  const xff = request.headers.get('X-Forwarded-For');
  if (xff) return xff.split(',')[0]?.trim() || '';
  return '';
}

async function verifyTurnstile(
  env: Env,
  token: string,
  request: Request
): Promise<boolean> {
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET,
      response: token,
      remoteip: clientIp(request),
    }),
  });

  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
}

async function sendBaleMessage(
  env: Env,
  chatId: string,
  text: string
): Promise<{ ok: boolean; status: number }> {
  const url = `${BALE_API_BASE}/bot${env.BALE_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  let data: { ok?: boolean } | null = null;
  try {
    data = (await res.json()) as { ok?: boolean };
  } catch {
    // ignore
  }

  return { ok: res.ok && Boolean(data?.ok), status: res.status };
}

function chatIdFor(env: Env, recipient: Recipient): string {
  if (recipient === 'partnership' && env.BALE_PARTNERSHIP_CHAT_ID?.trim()) {
    return env.BALE_PARTNERSHIP_CHAT_ID.trim();
  }
  if ((recipient === 'sales' || recipient === 'partnership') && env.BALE_SALES_CHAT_ID?.trim()) {
    return env.BALE_SALES_CHAT_ID.trim();
  }
  return env.BALE_PROCUREMENT_CHAT_ID;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    if (request.method !== 'POST') {
      return json(env, request, { ok: false, error: 'Method not allowed' }, 405);
    }

    if (
      !env.BALE_BOT_TOKEN ||
      !env.BALE_PROCUREMENT_CHAT_ID ||
      !env.TURNSTILE_SECRET
    ) {
      console.error('Missing required Worker secrets');
      return json(
        env,
        request,
        { ok: false, error: 'ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.' },
        500
      );
    }

    let body: LeadBody;
    try {
      body = (await request.json()) as LeadBody;
    } catch {
      return json(env, request, { ok: false, error: 'درخواست نامعتبر است' }, 400);
    }

    const turnstileToken =
      body.turnstileToken?.trim() ||
      body['cf-turnstile-response']?.trim() ||
      '';

    if (!turnstileToken) {
      return json(
        env,
        request,
        { ok: false, error: 'لطفاً تأیید امنیتی را تکمیل کنید.' },
        400
      );
    }

    const captchaOk = await verifyTurnstile(env, turnstileToken, request);
    if (!captchaOk) {
      return json(
        env,
        request,
        { ok: false, error: 'تأیید امنیتی نامعتبر است. لطفاً دوباره تلاش کنید.' },
        403
      );
    }

    const recipient = (body.recipient ?? 'procurement') as Recipient;
    if (recipient !== 'procurement' && recipient !== 'sales' && recipient !== 'partnership') {
      return json(env, request, { ok: false, error: 'گیرنده نامعتبر است' }, 400);
    }

    const validationError =
      recipient === 'sales'
        ? validateSales(body)
        : recipient === 'partnership'
          ? validatePartnership(body)
          : validateProcurement(body);
    if (validationError) {
      return json(env, request, { ok: false, error: validationError }, 400);
    }

    const text =
      recipient === 'partnership'
        ? formatPartnershipMessage({
            contactPerson: body.contactPerson!.trim(),
            phone: body.phone!.trim(),
            cooperationType: body.cooperationType!.trim(),
            message: body.message!.trim(),
            companyName: body.companyName?.trim() ?? '',
          })
        : recipient === 'sales'
        ? formatSalesMessage({
            contactPerson: body.contactPerson!.trim(),
            phone: body.phone!.trim(),
            topic: body.topic!.trim(),
            message: body.message!.trim(),
            companyName: body.companyName?.trim() ?? '',
          })
        : formatProcurementMessage({
            companyName: body.companyName!.trim(),
            contactPerson: body.contactPerson!.trim(),
            phone: body.phone!.trim(),
            materialType: body.materialType!.trim(),
            quantity: body.quantity!.trim(),
            message: body.message?.trim() ?? '',
          });

    try {
      const result = await sendBaleMessage(env, chatIdFor(env, recipient), text);
      if (!result.ok) {
        console.error('Bale sendMessage failed', result.status);
        return json(
          env,
          request,
          { ok: false, error: 'ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.' },
          500
        );
      }
      return json(env, request, { ok: true });
    } catch (error) {
      console.error('Worker error', error);
      return json(
        env,
        request,
        { ok: false, error: 'ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.' },
        500
      );
    }
  },
};
