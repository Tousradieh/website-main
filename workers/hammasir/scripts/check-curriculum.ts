/**
 * Sanity checks for src/curriculum: run with `npm run check:curriculum`.
 * Fails on duplicate ids, ids not prefixed with their track id (admin stats rely on it),
 * out-of-range weeks or answers, and quizzes that are too short.
 */
import { TRACKS } from '../src/curriculum';

const errors: string[] = [];
const seen = new Set<string>();
const answerSpread = [0, 0, 0, 0];

for (const track of TRACKS) {
  if (track.modules.length < 3) errors.push(`${track.id}: fewer than 3 modules`);
  if (track.capstone.steps.length < 3) errors.push(`${track.id}: capstone needs at least 3 steps`);
  for (const module of track.modules) {
    if (seen.has(module.id)) errors.push(`duplicate module id ${module.id}`);
    seen.add(module.id);
    if (!module.id.startsWith(`${track.id}-`) || !/^[a-z]+-\d+$/.test(module.id)) {
      errors.push(`${module.id}: id must be "${track.id}-<n>"`);
    }
    if (module.week < 1 || module.week > 13) errors.push(`${module.id}: week out of range`);
    if (module.quiz.length < 3) errors.push(`${module.id}: quiz needs at least 3 questions`);
    module.quiz.forEach((question, i) => {
      if (question.answer < 0 || question.answer >= question.options.length) {
        errors.push(`${module.id} q${i + 1}: answer index out of range`);
      }
      if (new Set(question.options).size !== question.options.length) {
        errors.push(`${module.id} q${i + 1}: duplicate options`);
      }
      if (!question.explain) errors.push(`${module.id} q${i + 1}: missing explanation`);
      answerSpread[question.answer] = (answerSpread[question.answer] ?? 0) + 1;
    });
  }
}

const modules = TRACKS.reduce((sum, track) => sum + track.modules.length, 0);
const questions = TRACKS.reduce((sum, track) => sum + track.modules.reduce((n, m) => n + m.quiz.length, 0), 0);
console.log(`${TRACKS.length} tracks, ${modules} modules, ${questions} questions; answer positions:`, answerSpread);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('curriculum OK');
