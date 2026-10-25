export { toSpam, toKorean, type SpamOptions, type KoreanOptions } from './transform.js';
export {
  getTemplate,
  isTemplateKind,
  TEMPLATE_KINDS,
  TEMPLATE_LABELS,
  type TemplateKind,
  type TemplateOptions,
} from './templates.js';
export type { Rng } from './rng.js';
export {
  SITUATIONS,
  SITUATION_IDS,
  SITUATION_KEYWORDS,
  getReply,
  getReplyLine,
  getSituation,
  isSituationId,
  matchSituation,
  type ReplyLineOptions,
  type ReplyOptions,
  type Situation,
  type SituationId,
} from './situations.js';
