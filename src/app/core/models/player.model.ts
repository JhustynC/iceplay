export type PlayerStatus = 'active' | 'injured' | 'suspended' | 'inactive';

/**
 * Player entity
 */
export interface Player {
  id: string;
  teamId: string;
  championshipId: string; // Denormalized for queries
  organizationId: string; // Denormalized for queries

  // Personal information
  firstName: string;
  lastName: string;
  fullName: string; // Computed: firstName + lastName
  nickname?: string;

  // Sports information
  number: number;
  position: string; // Position code according to sport
  secondaryPosition?: string;

  // Additional information
  document?: string; // ID number (cedula, DNI, etc.)
  birthDate?: Date;
  age?: number; // Computed
  nationality?: string;
  height?: number; // In cm
  weight?: number; // In kg
  photo?: string;

  // Status
  status: PlayerStatus;
  suspensionEndDate?: Date;
  suspensionReason?: string;

  // Accumulated statistics (auto-updated)
  stats: PlayerStats;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Player statistics (varies by sport)
 */
export interface PlayerStats {
  matchesPlayed: number;
  minutesPlayed: number;

  // Football
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  ownGoals?: number;
  penaltiesScored?: number;
  penaltiesMissed?: number;

  // Basketball
  points?: number;
  freeThrows?: number;
  twoPointers?: number;
  threePointers?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;

  // Volleyball
  aces?: number;
  blockPoints?: number;
  kills?: number;
  digs?: number;
  errors?: number;
}

/**
 * DTO for creating a new player
 */
export interface CreatePlayerDto {
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  document?: string; // ID number (cedula, DNI, etc.)
  birthDate?: Date;
  nationality?: string;
  height?: number;
  weight?: number;
  photo?: string;
}

/**
 * DTO for updating a player
 */
export interface UpdatePlayerDto {
  firstName?: string;
  lastName?: string;
  fullName?: string; // Allow updating fullName directly
  nickname?: string;
  number?: number;
  position?: string;
  secondaryPosition?: string;
  document?: string;
  birthDate?: Date;
  nationality?: string;
  height?: number;
  weight?: number;
  photo?: string;
  status?: PlayerStatus;
  suspensionEndDate?: Date;
  suspensionReason?: string;
  teamId?: string; // Allow changing team
  championshipId?: string; // Allow changing championship
}

/**
 * Simplified player info for lineups and event logging
 */
export interface PlayerBasicInfo {
  id: string;
  fullName: string;
  number: number;
  position: string;
  photo?: string;
}

/**
 * Create empty player stats
 */
export function createEmptyPlayerStats(): PlayerStats {
  return {
    matchesPlayed: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    ownGoals: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,
    points: 0,
    freeThrows: 0,
    twoPointers: 0,
    threePointers: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    aces: 0,
    blockPoints: 0,
    kills: 0,
    digs: 0,
    errors: 0,
  };
}
