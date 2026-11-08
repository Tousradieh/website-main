import * as admin from './admin';
import { login, logout, requireAdmin, requireEmployee } from './auth';
import * as campaign from './campaign';
import * as engagement from './engagement';
import { campaignStatus, corsHeaders, ERRORS, HttpError, json, MAX_ADMIN_BODY_BYTES, readJson, type Env } from './http';
import * as learning from './learning';
import { leaderboard, peoplePoints } from './points';

const ADMIN: learning.Reviewer = { kind: 'admin' };

async function route(env: Env, request: Request): Promise<unknown> {
  const { pathname } = new URL(request.url);
  const method = request.method;

  if (method === 'POST' && pathname === '/api/login') return login(env, request);
  if (method === 'POST' && pathname === '/api/logout') return logout(env, request);

  if (pathname.startsWith('/api/admin/')) return routeAdmin(env, request, method, pathname);
  if (!pathname.startsWith('/api/')) throw new HttpError(404, ERRORS.notFound);

  // Everything below is for signed-in personnel only.
  const employee = await requireEmployee(env, request);
  let match: RegExpMatchArray | null;

  if (method === 'GET' && pathname === '/api/me') return campaign.me(env, employee);
  if (method === 'GET' && pathname === '/api/leaderboard') {
    return { ok: true, teams: await leaderboard(env), campaign: campaignStatus(env) };
  }

  if (method === 'GET' && pathname === '/api/quizzes') return campaign.listQuizzes(env, employee);
  if ((match = pathname.match(/^\/api\/quizzes\/(\d+)$/)) && method === 'GET') {
    return campaign.getQuiz(env, Number(match[1]));
  }
  if ((match = pathname.match(/^\/api\/quizzes\/(\d+)\/submit$/)) && method === 'POST') {
    return campaign.submitQuiz(env, employee, request, Number(match[1]));
  }

  if (method === 'GET' && pathname === '/api/activities') return campaign.listActivities(env, employee);
  if ((match = pathname.match(/^\/api\/activities\/(\d+)\/claim$/)) && method === 'POST') {
    return campaign.claimActivity(env, employee, request, Number(match[1]));
  }

  if (method === 'GET' && pathname === '/api/tracks') return learning.listTracks(env, employee);
  if ((match = pathname.match(/^\/api\/tracks\/([a-z-]+)$/)) && method === 'GET') {
    return learning.getTrack(env, employee, match[1]);
  }
  if ((match = pathname.match(/^\/api\/tracks\/([a-z-]+)\/modules\/([a-z0-9-]+)$/)) && method === 'GET') {
    return learning.getModule(env, employee, match[1], match[2]);
  }
  if ((match = pathname.match(/^\/api\/tracks\/([a-z-]+)\/modules\/([a-z0-9-]+)\/submit$/)) && method === 'POST') {
    return learning.submitModule(env, employee, request, match[1], match[2]);
  }
  if ((match = pathname.match(/^\/api\/tracks\/([a-z-]+)\/capstone$/)) && method === 'POST') {
    return learning.submitCapstone(env, employee, request, match[1]);
  }

  if (method === 'POST' && pathname === '/api/profile') return engagement.saveProfile(env, employee, request);
  if (method === 'GET' && pathname === '/api/improvements') return engagement.myImprovements(env, employee);
  if (method === 'POST' && pathname === '/api/improvements') return engagement.submitImprovement(env, employee, request);
  if (method === 'GET' && pathname === '/api/store') return engagement.storeFor(env, employee);
  if (method === 'POST' && pathname === '/api/store/redeem') return engagement.redeem(env, employee, request);

  // Managers / supervisors: their own unit only.
  if (pathname.startsWith('/api/team')) {
    if (method === 'GET' && pathname === '/api/team') return engagement.teamDashboard(env, employee);
    const manager = engagement.requireManager(employee);
    if (method === 'POST' && pathname === '/api/team/capstones/review') return learning.reviewCapstone(env, request, manager);
    if (method === 'POST' && pathname === '/api/team/claims/review') return admin.reviewClaim(env, request, manager);
    if (method === 'POST' && pathname === '/api/team/improvements/review') {
      return engagement.reviewImprovement(env, request, manager);
    }
    if (method === 'POST' && pathname === '/api/team/messages') return engagement.sendMessage(env, request, manager);
  }

  throw new HttpError(404, ERRORS.notFound);
}

async function routeAdmin(env: Env, request: Request, method: string, pathname: string): Promise<unknown> {
  await requireAdmin(env, request);
  let match: RegExpMatchArray | null;

  if (method === 'GET' && pathname === '/api/admin/overview') return admin.overview(env);
  if (method === 'GET' && pathname === '/api/admin/people') return { ok: true, people: await peoplePoints(env) };
  if (method !== 'POST') throw new HttpError(404, ERRORS.notFound);

  if (pathname === '/api/admin/quizzes') return admin.addQuiz(env, request);
  if ((match = pathname.match(/^\/api\/admin\/quizzes\/(\d+)\/delete$/))) return admin.deleteQuiz(env, Number(match[1]));
  if (pathname === '/api/admin/activities') return admin.addActivity(env, request);
  if ((match = pathname.match(/^\/api\/admin\/activities\/(\d+)\/delete$/))) {
    return admin.deleteActivity(env, Number(match[1]));
  }
  if (pathname === '/api/admin/claims/review') return admin.reviewClaim(env, request, ADMIN);
  if (pathname === '/api/admin/capstones/review') return learning.reviewCapstone(env, request, ADMIN);
  if (pathname === '/api/admin/improvements/review') return engagement.reviewImprovement(env, request, ADMIN);
  if (pathname === '/api/admin/messages') return engagement.sendMessage(env, request, ADMIN);
  if (pathname === '/api/admin/rewards') return engagement.addReward(env, request);
  if ((match = pathname.match(/^\/api\/admin\/rewards\/(\d+)\/archive$/))) {
    return engagement.archiveReward(env, Number(match[1]));
  }
  if (pathname === '/api/admin/redemptions/review') return engagement.reviewRedemption(env, request);

  const imports: Record<string, (env: Env, text: string) => Promise<unknown>> = {
    '/api/admin/teams': admin.importTeams,
    '/api/admin/employees': admin.importEmployees,
    '/api/admin/missions': admin.importMissions,
  };
  const importer = imports[pathname];
  if (!importer) throw new HttpError(404, ERRORS.notFound);
  const { text } = await readJson<{ text?: unknown }>(request, MAX_ADMIN_BODY_BYTES);
  if (typeof text !== 'string' || !text.trim()) throw new HttpError(400, 'متنی برای ثبت وارد نشده است');
  return importer(env, text);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    try {
      return json(env, request, await route(env, request));
    } catch (error) {
      if (error instanceof HttpError) {
        return json(env, request, { ok: false, error: error.message }, error.status);
      }
      console.error('Worker error', error);
      return json(env, request, { ok: false, error: ERRORS.server }, 500);
    }
  },
};
