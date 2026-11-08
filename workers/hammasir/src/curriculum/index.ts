import type { Capstone, Department, Module, Question, Track } from './types';
import { strategyTrack } from './strategy';
import { managementTrack } from './management';
import { technicalTrack } from './technical';
import { plantsTrack } from './plants';
import { machineryTrack } from './machinery';
import { financeTrack } from './finance';
import { salesTrack } from './sales';
import { hrTrack } from './hr';
import { rndTrack } from './rnd';
import { osmTrack } from './osm';
import { aiTrack } from './ai';

export * from './types';

/** FNV-1a string hash, used as a stable seed. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Authors tend to put the right answer in the same slot, which makes quizzes guessable.
 * Shuffle each question's options with a seed from its id so the order is random-looking
 * but identical on every request (the served order is the one answers are graded against).
 */
function shuffleOptions(question: Question, seedKey: string): Question {
  let seed = hash(seedKey);
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = question.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer),
  };
}

function withShuffledOptions(track: Track): Track {
  return {
    ...track,
    modules: track.modules.map((module) => ({
      ...module,
      quiz: module.quiz.map((question, i) => shuffleOptions(question, `${module.id}:${i}`)),
    })),
  };
}

/** Display order: the shared strategy track, the managers' programme, the eight units, then AI. */
export const TRACKS: Track[] = [
  strategyTrack,
  managementTrack,
  technicalTrack,
  plantsTrack,
  machineryTrack,
  financeTrack,
  salesTrack,
  hrTrack,
  rndTrack,
  osmTrack,
  aiTrack,
].map(withShuffledOptions);

/** Points for a perfect first attempt at a module quiz. */
export const MODULE_POINTS = 40;
/** Share of correct answers needed to pass a module. */
export const PASS_RATIO = 0.7;

const trackById = new Map(TRACKS.map((track) => [track.id, track]));

export function findTrack(id: string): Track | undefined {
  return trackById.get(id);
}

export function findModule(track: Track, moduleId: string): Module | undefined {
  return track.modules.find((module) => module.id === moduleId);
}

export interface Learner {
  department: Department | null;
  isManager: boolean;
}

/** Shared tracks for everyone, the managers' programme for managers, and the person's own unit track. */
export function canAccess(track: Track, learner: Learner): boolean {
  if (track.audience === 'all') return true;
  if (track.audience === 'managers') return learner.isManager;
  return track.audience === learner.department;
}

/** The final assignment for this person: a manager or unit variant when the track has one. */
export function capstoneFor(track: Track, learner: Learner): Capstone {
  const variant =
    (learner.isManager ? track.capstoneVariants?.managers : undefined) ??
    (learner.department ? track.capstoneVariants?.[learner.department] : undefined);
  return variant ? { ...variant, points: track.capstone.points } : track.capstone;
}
