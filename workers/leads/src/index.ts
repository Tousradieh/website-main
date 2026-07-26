interface Env {
  BALE_BOT_TOKEN: string;
  BALE_PROCUREMENT_CHAT_ID: string;
  ALLOWED_ORIGIN?: string;
}

interface LeadBody {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  materialType?: string;
  quantity?: string;
  message?: string;
  recipient?: string;
}

const BALE_API_BASE = 'https://tapi.bale.ai';

const materialTypeLabels: Record<string, string> = {
  'asphalt-hot': 'آسفالت گرم',
  'asphalt-cold': 'آسفالت سرد',
  concrete: 'بتن آماده',
  'bitumen-60': 'قیر ۶۰/۷۰',
  'bitumen-80': 'قیر ۸۰/۱۰۰',
  'bitumen-pmb': 'قیر پلیمری PMB',
  emulsion: 'امولسیون قیری',
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

function validateLead(body: LeadBody): string | null {
  if (!body.companyName?.trim()) return 'نام شرکت الزامی است';
  if (!body.contactPerson?.trim()) return 'نام مسئول الزامی است';
  if (!body.phone?.trim()) return 'شماره تماس الزامی است';
  if (!body.materialType?.trim()) return 'نوع مصالح الزامی است';
  if (!body.quantity?.trim()) return 'میزان نیاز الزامی است';
  return null;
}

function formatLeadMessage(lead: Required<Pick<LeadBody, 'companyName' | 'contactPerson' | 'phone' | 'materialType' | 'quantity'>> & { message?: string }): string {
  const material =
    materialTypeLabels[lead.materialType] ?? lead.materialType;

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

async function sendBaleMessage(
  env: Env,
  text: string
): Promise<{ ok: boolean; status: number }> {
  const url = `${BALE_API_BASE}/bot${env.BALE_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.BALE_PROCUREMENT_CHAT_ID,
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    if (request.method !== 'POST') {
      return json(env, request, { ok: false, error: 'Method not allowed' }, 405);
    }

    if (!env.BALE_BOT_TOKEN || !env.BALE_PROCUREMENT_CHAT_ID) {
      console.error('Missing BALE_BOT_TOKEN or BALE_PROCUREMENT_CHAT_ID');
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

    const recipient = body.recipient ?? 'procurement';
    if (recipient !== 'procurement') {
      return json(env, request, { ok: false, error: 'گیرنده نامعتبر است' }, 400);
    }

    const validationError = validateLead(body);
    if (validationError) {
      return json(env, request, { ok: false, error: validationError }, 400);
    }

    const text = formatLeadMessage({
      companyName: body.companyName!.trim(),
      contactPerson: body.contactPerson!.trim(),
      phone: body.phone!.trim(),
      materialType: body.materialType!.trim(),
      quantity: body.quantity!.trim(),
      message: body.message?.trim() ?? '',
    });

    try {
      const result = await sendBaleMessage(env, text);
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
