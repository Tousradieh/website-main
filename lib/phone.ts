/** Normalize an Iranian landline or mobile number to `0XXXXXXXXXX`, or `null`. */
export function normalizeIranianPhone(value: string): string | null {
  let digits = value.replace(/[^\d+]/g, '');
  digits = digits.replace(/^(?:\+|00)/, '');
  if (digits.startsWith('98')) {
    digits = digits.slice(2);
  }
  if (!digits.startsWith('0')) {
    digits = `0${digits}`;
  }
  if (!/^0\d{10}$/.test(digits)) return null;
  return digits;
}

export function isIranianPhone(value: string): boolean {
  return normalizeIranianPhone(value) !== null;
}
