import type { Team, TeamBasicInfo } from './team.model';

export type MatchStatus =
  | 'scheduled'
  | 'warmup'
  | 'live'
  | 'halftime'
  | 'break' // Between quarters/sets
  | 'overtime'
  | 'penalties'
  | 'finished'
  | 'suspended'
  | 'postponed'
  | 'cancelled';

/**
 * Match entity
 */
export interface Match {
  id: string;
  championshipId: string;
  organizationId: string; // Denormalized

  // Teams
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: TeamBasicInfo; // Populated
  awayTeam?: TeamBasicInfo; // Populated

  // Main score
  homeScore: number;
  awayScore: number;

  // Status
  status: MatchStatus;

  // Scheduling
  round: number; // Matchday/Round
  matchday: number; // Order within round
  group?: string; // For group stage: "A", "B", etc.
  stage?: string; // "group_stage", "quarterfinals", etc.

  // Dates and venue
  scheduledDate: Date;
  scheduledTime: string; // "15:00"
  actualStartTime?: Date;
  actualEndTime?: Date;
  venue?: string;
  city?: string;

  // Referees
  referee?: string;
  assistantReferee1?: string;
  assistantReferee2?: string;

  // Game time
  currentPeriod: number; // Current half/quarter/set
  elapsedSeconds: number; // Seconds elapsed in current period
  isClockRunning: boolean;

  // Period scores (Basketball/Volleyball)
  periodScores: PeriodScore[];

  // Volleyball specific
  homeSets?: number;
  awaySets?: number;

  // Metadata
  notes?: string;
  isHighlighted: boolean; // Featured match
  streamUrl?: string; // Streaming link

  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodScore {
  period: number;
  homeScore: number;
  awayScore: number;
}

/**
 * DTO for creating a new match
 */
export interface CreateMatchDto {
  homeTeamId: string;
  awayTeamId: string;
  scheduledDate: Date;
  scheduledTime: string;
  round: number;
  matchday?: number;
  group?: string;
  stage?: string;
  venue?: string;
  referee?: string;
}

/**
 * DTO for updating a match
 */
export interface UpdateMatchDto {
  scheduledDate?: Date;
  scheduledTime?: string;
  venue?: string;
  referee?: string;
  assistantReferee1?: string;
  assistantReferee2?: string;
  status?: MatchStatus;
  notes?: string;
  isHighlighted?: boolean;
  streamUrl?: string;
}

/**
 * DTO for updating match score during live control
 */
export interface UpdateMatchScoreDto {
  homeScore: number;
  awayScore: number;
  currentPeriod?: number;
  elapsedSeconds?: number;
  periodScores?: PeriodScore[];
  homeSets?: number;
  awaySets?: number;
}

/**
 * Match with full team data
 */
export interface MatchWithTeams extends Match {
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * Match list item for displaying in lists
 */
export interface MatchListItem {
  id: string;
  homeTeam: TeamBasicInfo;
  awayTeam: TeamBasicInfo;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  scheduledDate: Date;
  scheduledTime: string;
  round: number;
  venue?: string;
  currentPeriod?: number;
  elapsedSeconds?: number;
}

/**
 * Get status label in Spanish
 */
export function getMatchStatusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    scheduled: 'Programado',
    warmup: 'Calentamiento',
    live: 'En Vivo',
    halftime: 'Medio Tiempo',
    break: 'Descanso',
    overtime: 'Tiempo Extra',
    penalties: 'Penales',
    finished: 'Finalizado',
    suspended: 'Suspendido',
    postponed: 'Pospuesto',
    cancelled: 'Cancelado',
  };
  return labels[status];
}

/**
 * Check if match is in a playable state
 */
export function isMatchPlayable(status: MatchStatus): boolean {
  return ['live', 'halftime', 'break', 'overtime', 'penalties', 'warmup'].includes(status);
}

