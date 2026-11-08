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

// ---------- admin auth & imports ----------
check('admin bad token 401', (await call('/api/admin/overview', { token: 'wrong-token-xxxxxxxxxx' })).status === 401);
check('admin no token 401', (await call('/api/admin/overview')).status === 401);
let r = await call('/api/admin/overview', { token: ADMIN });
check('admin overview ok', r.status === 200 && r.data.ok, r.data);
check('overview has 7 tracks', r.data.tracks?.length === 7, r.data.tracks);

r = await admin('/api/admin/teams', { text: 'id,name\nsite-a,کارگاه الف\nBad Id,غلط\nsite-b,کارگاه ب' });
check('teams import 2 ok + 1 error', r.data.imported === 2 && r.data.errors.length === 1, r.data);

r = await admin('/api/admin/employees', {
  text: [
    'کد\tنام\tواحد\tرمز\tحوزه',
    '۲۰۰۱\tتکنسین الف\tsite-a\t۱۲۳۴۵۶\ttechnical',
    '2002\tحسابدار ب\tsite-a\t223344\tfinance',
    '2003\tبدون حوزه\tsite-b\t334455\t',
    '2004\tمدیر\tsite-b\t445566\tmanagement',
    '2005\tرمز کوتاه\tsite-a\t1234\ttechnical',
    '2006\tحوزه غلط\tsite-a\t556677\tmarketing',
    '2007\tواحد غلط\tnowhere\t556677\thr',
  ].join('\n'),
});
check('employees import 4 ok + 3 errors', r.data.imported === 4 && r.data.errors.length === 3, r.data);

// ---------- login ----------
async function login(code, pin) {
  return call('/api/login', { body: { code, pin } });
}
r = await login('2001', '000000');
check('wrong pin 401', r.status === 401 && r.data.error, r.data);
r = await login('9999', '123456');
check('unknown code 401 same message', r.status === 401 && r.data.error === 'کد پرسنلی یا رمز اشتباه است', r.data);
r = await login('2001', '123456');
const tA = r.data.token;
check('login A (ascii pin of persian-imported)', r.status === 200 && tA?.length === 64, r.data);
const tB = (await login('2002', '۲۲۳۳۴۴')).data.token;
const tC = (await login('2003', '334455')).data.token;
const tM = (await login('2004', '445566')).data.token;
check('login B, C, M', tB && tC && tM);

// ---------- personnel auth ----------
check('leaderboard requires auth', (await call('/api/leaderboard')).status === 401);
check('me requires auth', (await call('/api/me')).status === 401);
check('bogus token 401', (await call('/api/me', { token: 'a'.repeat(64) })).status === 401);
r = await call('/api/me', { token: tA });
check('me A', r.status === 200 && r.data.employee.department === 'technical' && r.data.wallet.total === 0, r.data);

// ---------- tracks access ----------
const trackIds = async (t) => (await call('/api/tracks', { token: t })).data.tracks.map((x) => x.id);
check('A tracks', JSON.stringify(await trackIds(tA)) === JSON.stringify(['strategy', 'technical', 'ai']));
check('B tracks', JSON.stringify(await trackIds(tB)) === JSON.stringify(['strategy', 'finance', 'ai']));
check('C tracks (no dept)', JSON.stringify(await trackIds(tC)) === JSON.stringify(['strategy', 'ai']));
check('M tracks', JSON.stringify(await trackIds(tM)) === JSON.stringify(['strategy', 'management', 'ai']));
check('A cannot open finance track', (await call('/api/tracks/finance', { token: tA })).status === 404);
check('A cannot open finance module', (await call('/api/tracks/finance/modules/finance-1', { token: tA })).status === 404);
check('module from other track 404', (await call('/api/tracks/technical/modules/strategy-1', { token: tA })).status === 404);
check('unknown track 404', (await call('/api/tracks/nope', { token: tA })).status === 404);

r = await call('/api/tracks/technical/modules/technical-1', { token: tA });
check('module content ok', r.status === 200 && r.data.module.sections.length > 0 && r.data.module.quiz.length === 4, r.data);
check('module hides answers', !r.text.includes('"answer"') && !r.text.includes('"explain"'), r.text.slice(0, 200));

// ---------- module quiz ----------
const submitModule = (t, track, mod, answers) =>
  call(`/api/tracks/${track}/modules/${mod}/submit`, { token: t, body: { answers } });
check('wrong answer count 400', (await submitModule(tA, 'technical', 'technical-1', [0])).status === 400);
r = await submitModule(tA, 'technical', 'technical-1', [0, 0, 0, 0]);
check('first attempt', r.status === 200 && r.data.result.firstAttempt && r.data.answers.length === 4, r.data);
const correct = r.data.answers;
const firstEarned = r.data.result.earned;
check('first earned matches', firstEarned === Math.round((r.data.result.correct / 4) * 40), r.data.result);
r = await submitModule(tA, 'technical', 'technical-1', correct);
check('retry passes, no points', r.data.result.passed && r.data.result.earned === 0 && !r.data.result.firstAttempt, r.data);
r = await call('/api/me', { token: tA });
check('wallet = first attempt only', r.data.wallet.knowledge === firstEarned, r.data.wallet);

// ---------- capstone ----------
const capstone = (t, track, text) => call(`/api/tracks/${track}/capstone`, { token: t, body: { text } });
const longText = 'گزارش پروژه پایانی: '.repeat(10);
check('capstone before passing 403', (await capstone(tA, 'strategy', longText)).status === 403);

async function passTrack(t, trackId) {
  const track = (await call(`/api/tracks/${trackId}`, { token: t })).data.track;
  let earned = 0;
  for (const m of track.modules) {
    const first = await submitModule(t, trackId, m.id, [0, 0, 0, 0]);
    earned += first.data.result.earned;
    if (!first.data.result.passed) await submitModule(t, trackId, m.id, first.data.answers);
  }
  return earned;
}
const strategyEarned = await passTrack(tA, 'strategy');
r = await call('/api/tracks/strategy', { token: tA });
check('strategy all passed + capstone available', r.data.track.capstone.available === true, r.data.track.capstone);
check('capstone too short 400', (await capstone(tA, 'strategy', 'کوتاه')).status === 400);
check('capstone non-string 400', (await call('/api/tracks/strategy/capstone', { token: tA, body: { text: 42 } })).status === 400);
check('capstone ok', (await capstone(tA, 'strategy', longText)).status === 200);
check('capstone duplicate 409', (await capstone(tA, 'strategy', longText)).status === 409);
check('capstone other dept 404', (await capstone(tA, 'finance', longText)).status === 404);

r = await call('/api/admin/overview', { token: ADMIN });
const pend = r.data.pendingCapstones.find((c) => c.employeeCode === '2001');
check('admin sees pending capstone', pend && pend.trackTitle && pend.points === 120, r.data.pendingCapstones);
r = await admin('/api/admin/capstones/review', { employeeCode: '2001', trackId: 'strategy', approve: false, feedback: 'بند ۵ را کامل کنید' });
check('reject ok', r.status === 200);
r = await call('/api/tracks/strategy', { token: tA });
check('employee sees rejection feedback', r.data.track.capstone.submission.status === 'rejected' && r.data.track.capstone.submission.feedback === 'بند ۵ را کامل کنید');
check('resubmit after reject', (await capstone(tA, 'strategy', longText + ' اصلاح شد')).status === 200);
const before = (await call('/api/me', { token: tA })).data.wallet;
check('approve ok', (await admin('/api/admin/capstones/review', { employeeCode: '2001', trackId: 'strategy', approve: true })).status === 200);
check('approve twice 404', (await admin('/api/admin/capstones/review', { employeeCode: '2001', trackId: 'strategy', approve: true })).status === 404);
const after = (await call('/api/me', { token: tA })).data.wallet;
check('capstone points into missions', after.missions - before.missions === 120 && after.knowledge === before.knowledge, { before, after });
check('knowledge = module first points', after.knowledge === firstEarned + strategyEarned, { after, firstEarned, strategyEarned });
r = await call('/api/tracks', { token: tA });
check('track list shows approved', r.data.tracks.find((t) => t.id === 'strategy').capstoneStatus === 'approved');
r = await call('/api/admin/overview', { token: ADMIN });
const stat = r.data.tracks.find((t) => t.id === 'strategy');
check('track stats', stat.started === 1 && stat.completed === 1 && r.data.tracks.find((t) => t.id === 'technical').started === 1, r.data.tracks);
check('active count 1', r.data.counts.active === 1 && r.data.counts.noDepartment === 1, r.data.counts);

// ---------- leaderboard ----------
r = await call('/api/leaderboard', { token: tB });
const siteA = r.data.teams.find((t) => t.id === 'site-a');
check('leaderboard site-a avg', siteA.members === 2 && siteA.score === Math.round(after.total / 2) && siteA.participation === 50, r.data.teams);

// ---------- missions import ----------
r = await admin('/api/admin/missions', { text: '2002,3,40,ثبت\nteam:site-b,3,25,تیمی\n2002,99,1,\n2002,3,999999,' });
check('missions 2 ok 2 err', r.data.imported === 2 && r.data.errors.length === 2, r.data);
r = await call('/api/me', { token: tC });
check('team mission reaches member', r.data.wallet.missions === 25, r.data.wallet);

// ---------- weekly quiz & activities regression ----------
r = await call('/api/quizzes', { token: tB });
const quiz = r.data.quizzes[0];
check('seed quiz listed', quiz && quiz.open, r.data);
r = await call(`/api/quizzes/${quiz.id}`, { token: tB });
check('weekly quiz hides answers', !r.text.includes('"answer"'));
r = await call(`/api/quizzes/${quiz.id}/submit`, { token: tB, body: { answers: [1, 0, 2, 1] } });
check('weekly quiz submit', r.status === 200 && r.data.result.correct === 4, r.data);
check('weekly quiz once', (await call(`/api/quizzes/${quiz.id}/submit`, { token: tB, body: { answers: [1, 0, 2, 1] } })).status === 409);
r = await call('/api/activities', { token: tB });
const act = r.data.activities[0];
check('claim activity', (await call(`/api/activities/${act.id}/claim`, { token: tB, body: { note: 'x'.repeat(900) } })).status === 200);
r = await call('/api/admin/overview', { token: ADMIN });
const claim = r.data.pendingClaims.find((c) => c.employeeCode === '2002');
check('claim note truncated to 500', claim && claim.note.length === 500, claim);
check('approve claim', (await admin('/api/admin/claims/review', { employeeCode: '2002', activityId: act.id, approve: true })).status === 200);
r = await call('/api/me', { token: tB });
check('B wallet', r.data.wallet.knowledge === 100 + act.points && r.data.wallet.missions === 40, r.data.wallet);

// ---------- admin validation ----------
check('bad activity link', (await admin('/api/admin/activities', { week: 1, kind: 'course', title: 't', points: 10, link: 'javascript:alert(1)' })).status === 400);
check('bad activity kind', (await admin('/api/admin/activities', { week: 1, kind: 'x', title: 't', points: 10 })).status === 400);
check('activity points as string rejected', (await admin('/api/admin/activities', { week: 1, kind: 'course', title: 't', points: '10' })).status === 400);
check('bad quiz', (await admin('/api/admin/quizzes', { week: 1, title: 't', questions: [{ q: 'x', options: ['a'], answer: 0 }] })).status === 400);
r = await admin('/api/admin/quizzes', { week: 2, title: 'ok', questions: [{ q: 'x', options: ['a', 'b'], answer: 1, extra: '<script>' }] });
check('good quiz', r.status === 200 && r.data.id, r.data);
r = await call(`/api/quizzes/${r.data.id}`, { token: tB });
check('quiz extra field stripped', !r.text.includes('extra'));

// ---------- request hygiene ----------
check('non-object json 400', (await call('/api/login', { raw: '"x"' })).status === 400);
check('invalid json 400', (await call('/api/login', { raw: '{bad' })).status === 400);
check('large body 413', (await call('/api/tracks/strategy/capstone', { token: tA, raw: JSON.stringify({ text: 'x'.repeat(70000) }) })).status === 413);
check('unknown route 404', (await call('/api/nothing', { token: tA })).status === 404);
check('non-api path 404', (await call('/')).status === 404);
r = await call('/api/me', { token: tA });
check('security headers', r.headers.get('x-content-type-options') === 'nosniff' && r.headers.get('cache-control') === 'no-store');
r = await call('/api/me', { method: 'OPTIONS' });
check('preflight', r.status === 204 && r.headers.get('access-control-allow-headers')?.includes('Authorization'));

// ---------- sessions ----------
check('logout', (await call('/api/logout', { token: tM, body: {} })).status === 200);
check('session gone after logout', (await call('/api/me', { token: tM })).status === 401);
await admin('/api/admin/employees', { text: '2003,بدون حوزه,site-b,999888,hr' });
check('new PIN ends old sessions', (await call('/api/me', { token: tC })).status === 401);
r = await login('2003', '999888');
check('new pin works + dept updated', r.status === 200 && (await trackIds(r.data.token)).includes('hr'));
await admin('/api/admin/employees', { text: '2001,تکنسین الف,site-b,,technical' });
r = await call('/api/me', { token: tA });
check('blank pin keeps session, moves team', r.status === 200 && r.data.employee.teamId === 'site-b', r.data);

// ---------- per-employee lockout ----------
for (let i = 0; i < 4; i++) await login('2002', '000000');
r = await login('2002', '000000');
check('5th wrong pin locks', r.status === 429, r.data);
r = await login('2002', '223344');
check('locked even with right pin', r.status === 429, r.data);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
