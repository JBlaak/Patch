import type { PatchTime } from '../index';

/**
 * Where the family has gone on its adventure. Every place can be drawn at any
 * time of day; which place suits which moment (a campfire after dark, the
 * frozen canal in winter) is the host's call.
 */
export type PatchPlace =
  | 'campfire'
  | 'tents'
  | 'pier'
  | 'forest'
  | 'beach'
  | 'canal'
  | 'allotment'
  | 'dunes'
  | 'orchard'
  | 'stargazing'
  | 'tulips'
  | 'sledding';

export const PATCH_PLACES: readonly PatchPlace[] = [
  'campfire', 'tents', 'pier', 'forest', 'beach', 'canal',
  'allotment', 'dunes', 'orchard', 'stargazing', 'tulips', 'sledding',
];

/**
 * What a family member is up to. `working` is busy, `blocked` needs the host,
 * `ready` finished and is waiting to be seen, `idle` is resting.
 */
export type FamilyStatus = 'working' | 'blocked' | 'ready' | 'idle';

export interface FamilyMember {
  /** Stable id, handed back by `onSelect`. */
  id: string;
  /** Shown on hover and read out by screen readers; set as text, never markup. */
  name: string;
  status: FamilyStatus;
  /** Little helpers the member has out (subagents, say). At most four are drawn. */
  helpers: number;
  /** Body colour. Defaults to one of the family's pastels, picked from the id. */
  tint?: string;
  /** What the hover tag says under the name. Defaults to a word for the status. */
  detail?: string;
}

export interface FamilyScene {
  place: PatchPlace;
  time: PatchTime;
  /** Up to nine are drawn; any more stay home. */
  members: readonly FamilyMember[];
  /** Rain or snow falls over the place when set. */
  weather?: 'rain' | 'snow' | null;
  /** Walk everyone in from the side, as on arriving somewhere new. */
  arriving?: boolean;
}
