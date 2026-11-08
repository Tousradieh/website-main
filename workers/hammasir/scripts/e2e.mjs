// Usage: with a fresh local DB (npm run db:migrate:local && npm run db:seed:local) and
// `npx wrangler dev --port 8787 --var CAMPAIGN_START:2026-06-01` running with the .dev.vars
// from README.md, run `node scripts/e2e.mjs`. It creates test units/personnel in that DB.
const API = 'http://localhost:8787';
const ADMIN = 'dev-admin-token-0123456789';
let failures = 0;
let passes = 0;

function check(name, condition, detail) {
  if (condition) passes++;
  else {
    failures++;
    console.log(`FAIL ${name}`, detail === undefined ? '' : JSON.stringify(detail).slice(0, 400));
  }
}

async function call(path, { token, body, method, raw, headers = {} } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  if (body !== undefined || raw !== undefined) h['Content-Type'] = 'application/json';
  const res = await fetch(API + path, {
    method: method ?? (body !== undefined || raw !== undefined ? 'POST' : 'GET'),
    headers: h,
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {}
  return { status: res.status, data, text, headers: res.headers };
}

const admin = (path, body) => call(path, { token: ADMIN, body });
const login = (code, pin) => call('/api/login', { body: { code, pin } });
const me = async (t) => (await call('/api/me', { token: t })).data;

// ---------- admin auth & imports ----------
check('admin bad token 401', (await call('/api/admin/overview', { token: 'wrong-token-xxxxxxxxxx' })).status === 401);
let r = await call('/api/admin/overview', { token: ADMIN });
check('admin overview ok', r.status === 200 && r.data.ok, r.data);
check('overview has 11 tracks', r.data.tracks?.length === 11, r.data.tracks?.length);
check('overview store data', r.data.rewards?.length === 4 && Array.isArray(r.data.pendingRedemptions), r.data.rewards);

r = await admin('/api/admin/teams', { text: 'id,name\nsite-a,کارگاه الف\nBad Id,غلط\nsite-b,کارگاه ب' });
check('teams import 2 ok + 1 error', r.data.imported === 2 && r.data.errors.length === 1, r.data);

r = await admin('/api/admin/employees', {
  text: [
    'کد\tنام\tواحد\tرمز\tحوزه\tمدیر',
    '۲۰۰۱\tتکنسین الف\tsite-a\t۱۲۳۴۵۶\ttechnical\t',
    '2002\tحسابدار ب\tsite-a\t223344\tfinance\t',
    '2003\tبدون واحد\tsite-b\t334455\t\t',
    '2004\tمدیر الف\tsite-a\t445566\ttechnical\tمدیر',
    '2005\tمدیر قدیمی\tsite-b\t556677\tmanagement\t',
    '2006\tکارخانه\tsite-b\t667788\tplants\t',
    '2007\tرمز کوتاه\tsite-a\t1234\ttechnical\t',
    '2008\tحوزه غلط\tsite-a\t556677\tmarketing\t',
  ].join('\n'),
});
check('employees import 6 ok + 2 errors', r.data.imported === 6 && r.data.errors.length === 2, r.data);

const tA = (await login('2001', '123456')).data.token;
const tB = (await login('2002', '۲۲۳۳۴۴')).data.token;
const tC = (await login('2003', '334455')).data.token;
const tM = (await login('2004', '445566')).data.token;
const tOld = (await login('2005', '556677')).data.token;
const tP = (await login('2006', '667788')).data.token;
check('logins', [tA, tB, tC, tM, tOld, tP].every((t) => t?.length === 64));
check('wrong pin 401', (await login('2001', '000000')).status === 401);

// ---------- roles ----------
let m = await me(tM);
check('manager flag + unit', m.employee.isManager && m.employee.department === 'technical', m.employee);
m = await me(tOld);
check('legacy "management" -> manager, no unit', m.employee.isManager && m.employee.department === null, m.employee);
m = await me(tA);
check('wallet has 3 shares + balance', ['knowledge', 'ai', 'missions', 'total', 'spent', 'balance'].every((k) => k in m.wallet), m.wallet);
check('operational tasks = shared + unit', m.operationalTasks.length === 3 + 3, m.operationalTasks);

const trackIds = async (t) => (await call('/api/tracks', { token: t })).data.tracks.map((x) => x.id).join(',');
check('A tracks', (await trackIds(tA)) === 'strategy,technical,ai', await trackIds(tA));
check('B tracks', (await trackIds(tB)) === 'strategy,finance,ai');
check('C tracks (no unit)', (await trackIds(tC)) === 'strategy,ai');
check('M tracks (manager + unit)', (await trackIds(tM)) === 'strategy,management,technical,ai', await trackIds(tM));
check('P tracks (plants)', (await trackIds(tP)) === 'strategy,plants,ai');
check('A cannot open management', (await call('/api/tracks/management', { token: tA })).status === 404);

r = await call('/api/tracks/technical', { token: tA });
check('track has learning map + ops tasks', r.data.track.learningMap.length === 4 && r.data.track.operationalTasks.length === 3);
r = await call('/api/tracks/ai', { token: tP });
check('AI capstone variant for plants', r.data.track.capstone.title.includes('کارخانه'), r.data.track.capstone.title);
r = await call('/api/tracks/ai', { token: tM });
check('AI capstone variant for managers', r.data.track.capstone.title.includes('مدیران'), r.data.track.capstone.title);
r = await call('/api/tracks/technical/modules/technical-1', { token: tA });
check('module hides answers', r.status === 200 && !r.text.includes('"answer"') && !r.text.includes('"explain"'));

// ---------- module quiz and shares ----------
const submitModule = (t, track, mod, answers) => call(`/api/tracks/${track}/modules/${mod}/submit`, { token: t, body: { answers } });
async function passTrack(t, trackId) {
  const track = (await call(`/api/tracks/${trackId}`, { token: t })).data.track;
  let earned = 0;
  for (const mod of track.modules) {
    const first = await submitModule(t, trackId, mod.id, [0, 0, 0, 0]);
    earned += first.data.result.earned;
    if (!first.data.result.passed) await submitModule(t, trackId, mod.id, first.data.answers);
  }
  return earned;
}
r = await submitModule(tA, 'technical', 'technical-1', [0, 0, 0, 0]);
const firstEarned = r.data.result.earned;
r = await submitModule(tA, 'technical', 'technical-1', r.data.answers);
check('retry passes, no points', r.data.result.passed && r.data.result.earned === 0);
const aiEarned = await passTrack(tA, 'ai');
m = await me(tA);
check('AI modules -> ai share', m.wallet.ai === aiEarned && m.wallet.knowledge === firstEarned, m.wallet);

// ---------- capstones ----------
const longText = 'گزارش پروژه پایانی کامل: '.repeat(8);
const capstone = (t, track, text) => call(`/api/tracks/${track}/capstone`, { token: t, body: { text } });
check('capstone before passing 403', (await capstone(tA, 'strategy', longText)).status === 403);
const strategyEarned = await passTrack(tA, 'strategy');
check('strategy capstone ok', (await capstone(tA, 'strategy', longText)).status === 200);
check('ai capstone ok', (await capstone(tA, 'ai', longText)).status === 200);
check('capstone duplicate 409', (await capstone(tA, 'strategy', longText)).status === 409);

// manager scope: M (site-a) can see/approve A (site-a); not their own; Old (site-b) cannot
let team = (await call('/api/team', { token: tM })).data;
check('team dashboard lists A capstones', team.pendingCapstones.filter((c) => c.employeeCode === '2001').length === 2, team.pendingCapstones);
check('team excludes manager self', !team.members.some((x) => x.code === '2004') && team.members.some((x) => x.code === '2001'));
check('non-manager team 403', (await call('/api/team', { token: tA })).status === 403);
check('other-site manager cannot approve', (await call('/api/team/capstones/review', { token: tOld, body: { employeeCode: '2001', trackId: 'strategy', approve: true } })).status === 404);
check('non-manager cannot approve', (await call('/api/team/capstones/review', { token: tB, body: { employeeCode: '2001', trackId: 'strategy', approve: true } })).status === 403);
const before = (await me(tA)).wallet;
check('manager approves strategy', (await call('/api/team/capstones/review', { token: tM, body: { employeeCode: '2001', trackId: 'strategy', approve: true } })).status === 200);
check('admin approves ai', (await admin('/api/admin/capstones/review', { employeeCode: '2001', trackId: 'ai', approve: true })).status === 200);
let after = (await me(tA)).wallet;
check('strategy capstone -> missions, ai capstone -> ai', after.missions - before.missions === 120 && after.ai - before.ai === 120, { before, after });
check('knowledge = lesson first attempts', after.knowledge === firstEarned + strategyEarned, after);

// ---------- profile ----------
check('profile bad mobile 400', (await call('/api/profile', { token: tB, body: { jobTitle: 'حسابدار', mobile: '12345' } })).status === 400);
r = await call('/api/profile', { token: tB, body: { jobTitle: 'حسابدار', mobile: '۰۹۱۲۳۴۵۶۷۸۹' } });
check('profile saved + awarded', r.status === 200 && r.data.awarded === 20, r.data);
r = await call('/api/profile', { token: tB, body: { jobTitle: 'حسابدار ارشد', mobile: '09123456789' } });
check('profile update no second award', r.data.awarded === 0);
m = await me(tB);
check('profile points once', m.wallet.missions === 20 && m.employee.mobile === '09123456789', m);

// ---------- improvement projects ----------
const proj = { title: 'نوبت‌بندی ارسال آسفالت', category: 'waste', problem: 'فینیشر روزانه ۹۰ دقیقه منتظر آسفالت است', solution: 'اعلام نیاز تا ساعت ۱۴ روز قبل و نوبت‌بندی ارسال' };
check('improvement bad category 400', (await call('/api/improvements', { token: tA, body: { ...proj, category: 'x' } })).status === 400);
check('improvement short 400', (await call('/api/improvements', { token: tA, body: { ...proj, problem: 'کوتاه' } })).status === 400);
check('improvement submit', (await call('/api/improvements', { token: tA, body: proj })).status === 200);
const projects = (await call('/api/improvements', { token: tA })).data.projects;
check('my projects', projects.length === 1 && projects[0].status === 'pending');
team = (await call('/api/team', { token: tM })).data;
const pid = team.pendingImprovements[0]?.id;
check('manager sees improvement', !!pid);
check('approve without scores 400', (await call('/api/team/improvements/review', { token: tM, body: { id: pid, approve: true } })).status === 400);
check('reject without feedback 400', (await call('/api/team/improvements/review', { token: tM, body: { id: pid, approve: false } })).status === 400);
check('other-site manager 404', (await call('/api/team/improvements/review', { token: tOld, body: { id: pid, approve: true, ease: 5, impact: 5 } })).status === 404);
const beforeImp = (await me(tA)).wallet.missions;
r = await call('/api/team/improvements/review', { token: tM, body: { id: pid, approve: true, ease: 4, impact: 5 } });
check('approve improvement 4x5x8=160', r.status === 200 && r.data.points === 160, r.data);
check('improvement points -> missions', (await me(tA)).wallet.missions - beforeImp === 160);
r = await call('/api/admin/overview', { token: ADMIN });
check('top improvements', r.data.topImprovements[0]?.points === 160);
for (let i = 0; i < 3; i++) await call('/api/improvements', { token: tC, body: proj });
check('max 3 pending', (await call('/api/improvements', { token: tC, body: proj })).status === 409);

// ---------- store ----------
check('add reward', (await admin('/api/admin/rewards', { title: 'تست', cost: 50, stock: 1 })).status === 200);
check('bad reward', (await admin('/api/admin/rewards', { title: 'x', cost: -5 })).status === 400);
let store = (await call('/api/store', { token: tC })).data;
const cheap = store.rewards.find((x) => x.title === 'تست');
check('store lists rewards', cheap && cheap.left === 1);
check('redeem without points 409', (await call('/api/store/redeem', { token: tC, body: { rewardId: cheap.id } })).status === 409);
const aBefore = (await me(tA)).wallet;
check('redeem ok', (await call('/api/store/redeem', { token: tA, body: { rewardId: cheap.id } })).status === 200);
const aAfter = (await me(tA)).wallet;
check('balance reduced, total unchanged', aAfter.balance === aBefore.balance - 50 && aAfter.total === aBefore.total, { aBefore, aAfter });
check('stock exhausted 409', (await call('/api/store/redeem', { token: tB, body: { rewardId: cheap.id } })).status === 409);
r = await call('/api/admin/overview', { token: ADMIN });
const red = r.data.pendingRedemptions.find((x) => x.employeeCode === '2001');
check('admin sees redemption', !!red);
check('reject refunds', (await admin('/api/admin/redemptions/review', { id: red.id, approve: false })).status === 200 && (await me(tA)).wallet.balance === aBefore.balance);
check('archive reward', (await admin(`/api/admin/rewards/${cheap.id}/archive`, {})).status === 200);
store = (await call('/api/store', { token: tA })).data;
check('archived hidden', !store.rewards.some((x) => x.id === cheap.id));

// ---------- messages ----------
check('manager message own team', (await call('/api/team/messages', { token: tM, body: { to: '2001', text: 'آفرین!' } })).status === 200);
check('manager message other team 404', (await call('/api/team/messages', { token: tM, body: { to: '2003', text: 'سلام' } })).status === 404);
check('admin message anyone', (await admin('/api/admin/messages', { to: '2003', text: 'خوش آمدید' })).status === 200);
m = await me(tA);
check('member sees message', m.messages[0]?.text === 'آفرین!' && m.messages[0]?.fromName === 'مدیر الف', m.messages);

// ---------- league, people export, claims scope ----------
r = await call('/api/leaderboard', { token: tB });
check('leaderboard has sites', r.data.teams.some((t) => t.id === 'site-a'));
r = await call('/api/admin/people', { token: ADMIN });
check('people export', r.data.people.length >= 6 && 'total' in r.data.people[0]);
const act = (await call('/api/activities', { token: tA })).data.activities[0];
await call(`/api/activities/${act.id}/claim`, { token: tA, body: { note: 'دیدم' } });
check('other-site manager cannot approve claim', (await call('/api/team/claims/review', { token: tOld, body: { employeeCode: '2001', activityId: act.id, approve: true } })).status === 404);
check('manager approves claim', (await call('/api/team/claims/review', { token: tM, body: { employeeCode: '2001', activityId: act.id, approve: true } })).status === 200);

// ---------- hygiene ----------
check('non-object json 400', (await call('/api/login', { raw: '"x"' })).status === 400);
check('large body 413', (await call('/api/improvements', { token: tA, raw: JSON.stringify({ title: 'x'.repeat(70000) }) })).status === 413);
check('unknown route 404', (await call('/api/nothing', { token: tA })).status === 404);
check('logout', (await call('/api/logout', { token: tOld, body: {} })).status === 200);
check('session gone', (await call('/api/me', { token: tOld })).status === 401);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
