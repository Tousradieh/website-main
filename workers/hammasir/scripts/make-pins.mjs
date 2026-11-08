// Builds the personnel import file for the admin panel from a staff list, with a random
// 6-digit PIN per person, plus a PIN slip list for HR to hand out privately.
//
//   node scripts/make-pins.mjs sample-data/personnel.csv
//
// Input CSV columns (header row first): code, name, unit/site id, department, manager ("مدیر" or empty).
// Output (git-ignored): sample-data/private/personnel-import.csv  -> paste into «پرسنل» on /hammasir/admin
//                       sample-data/private/pin-slips.csv         -> code, name, PIN for distribution
// Never commit or share these files; re-running creates new PINs (importing them resets old ones).
import { randomInt } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const input = process.argv[2];
if (!input) {
  console.error('usage: node scripts/make-pins.mjs <staff.csv>');
  process.exit(1);
}

const lines = readFileSync(input, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((line) => line.trim());
const rows = lines.slice(1).map((line) => line.split(line.includes('\t') ? '\t' : ',').map((cell) => cell.trim()));

const used = new Set();
const pin = () => {
  let value;
  do value = String(randomInt(100000, 1000000));
  while (used.has(value) || /^(\d)\1+$/.test(value) || '0123456789'.includes(value) || '9876543210'.includes(value));
  used.add(value);
  return value;
};

const importRows = [];
const slips = [];
for (const [code, name, team, department = '', manager = ''] of rows) {
  if (!code || !name || !team) continue;
  const value = pin();
  importRows.push([code, name, team, value, department, manager].join(','));
  slips.push([code, name, value].join(','));
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'sample-data', 'private');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'personnel-import.csv'), '﻿' + importRows.join('\n') + '\n');
writeFileSync(join(outDir, 'pin-slips.csv'), '﻿کد,نام,رمز\n' + slips.join('\n') + '\n');
console.log(`${importRows.length} people -> ${outDir}`);
