import type { TeamBasicInfo } from './team.model';

/**
 * Standing/League table entry
 */
export interface Standing {
  id: string;
  championshipId: string;
  teamId: string;
  team?: TeamBasicInfo; // Populated
  group?: string; // For group stage format: "A", "B", etc.

  // Position
  position: number;
  previousPosition?: number; // To show position changes

  // Matches
  played: number;
  won: number;
  drawn: number;
  lost: number;

  // Goals/Points
  goalsFor: number; // Or points in basketball
  goalsAgainst: number;
  goalDifference: number; // Computed

  // League points
  points: number;

  // Form (last 5 matches)
  form: MatchResult[];

  // Volleyball specific
  setsWon?: number;
  setsLost?: number;
  setsDifference?: number;
  pointsRatio?: number; // Points quotient

  // Metadata
  updatedAt: Date;
}

export type MatchResult = 'W' | 'D' | 'L';

/**
 * Standing with full team data
 */
export interface StandingWithTeam extends Standing {
  team: TeamBasicInfo;
}

/**
 * Standings table for a championship or group
 */
export interface StandingsTable {
  championshipId: string;
  group?: string;
  standings: StandingWithTeam[];
  lastUpdated: Date;
}

/**
 * Create empty standing for a team
 */
export function createEmptyStanding(championshipId: string, teamId: string): Omit<Standing, 'id'> {
  return {
    championshipId,
    teamId,
    position: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: [],
    updatedAt: new Date(),
  };
}

/**
 * Calculate goal difference
 */
export function calculateGoalDifference(goalsFor: number, goalsAgainst: number): number {
  return goalsFor - goalsAgainst;
}

/**
 * Get position change indicator
 */
export function getPositionChange(
  current: number,
  previous?: number,
): 'up' | 'down' | 'same' | 'new' {
  if (previous === undefined) return 'new';
  if (current < previous) return 'up';
  if (current > previous) return 'down';
  return 'same';
}

