import type { Sport } from './sport-config.model';

export type ChampionshipStatus = 'draft' | 'registration' | 'active' | 'finished' | 'cancelled';
export type ChampionshipFormat = 'league' | 'knockout' | 'group_stage' | 'mixed';

/**
 * Championship/Tournament entity
 */
export interface Championship {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  sport: Sport;
  format: ChampionshipFormat;
  season: string; // "2024-2025"
  status: ChampionshipStatus;
  logo?: string;
  coverImage?: string;

  // Tournament configuration
  settings: ChampionshipSettings;

  // Dates
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  startDate: Date;
  endDate?: Date;

  // Summary statistics (denormalized for performance)
  totalTeams: number;
  totalMatches: number;
  matchesPlayed: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ChampionshipSettings {
  // Points per result (League format)
  pointsForWin: number; // Default: 3
  pointsForDraw: number; // Default: 1
  pointsForLoss: number; // Default: 0

  // Format configuration
  roundsCount: number; // 1 = single round, 2 = home and away
  teamsPerGroup?: number; // For group stage format
  teamsAdvancePerGroup?: number;

  // Tiebreaker rules (in priority order)
  tiebreakers: TiebreakerRule[];

  // Match rules
  allowDraws: boolean; // Volleyball: false
  extraTimeAllowed: boolean;
  penaltyShootoutAllowed: boolean;
}

export type TiebreakerRule =
  | 'goal_difference'
  | 'goals_for'
  | 'head_to_head'
  | 'head_to_head_goal_difference'
  | 'points_in_head_to_head'
  | 'fair_play';

/**
 * DTO for creating a new championship
 */
export interface CreateChampionshipDto {
  name: string;
  sport: Sport;
  format: ChampionshipFormat;
  season: string;
  startDate: Date;
  description?: string;
  settings?: Partial<ChampionshipSettings>;
}

/**
 * DTO for updating a championship
 */
export interface UpdateChampionshipDto {
  name?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  status?: ChampionshipStatus;
  startDate?: Date;
  endDate?: Date;
  settings?: Partial<ChampionshipSettings>;
}

/**
 * Default championship settings by sport
 */
export function getDefaultChampionshipSettings(sport: Sport): ChampionshipSettings {
  const baseSettings: ChampionshipSettings = {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    roundsCount: 2,
    tiebreakers: ['goal_difference', 'goals_for', 'head_to_head'],
    allowDraws: true,
    extraTimeAllowed: false,
    penaltyShootoutAllowed: false,
  };

  switch (sport) {
    case 'volleyball':
      return {
        ...baseSettings,
        pointsForWin: 3,
        pointsForDraw: 0, // No draws in volleyball
        allowDraws: false,
        tiebreakers: ['goal_difference', 'goals_for'], // Sets difference, points ratio
      };
    case 'basketball':
      return {
        ...baseSettings,
        pointsForWin: 2,
        pointsForDraw: 1,
        allowDraws: false, // Usually no draws, overtime
        extraTimeAllowed: true,
      };
    default:
      return baseSettings;
  }
}

