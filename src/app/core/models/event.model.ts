import type { PlayerBasicInfo } from './player.model';
import type { TeamBasicInfo } from './team.model';

/**
 * Match event entity
 */
export interface MatchEvent {
  id: string;
  matchId: string;
  championshipId: string; // Denormalized for queries

  // Event information
  type: string; // Event type code according to sport

  // Participants
  playerId: string;
  player?: PlayerBasicInfo; // Populated
  teamId: string;
  team?: TeamBasicInfo; // Populated

  // For substitutions
  relatedPlayerId?: string; // Player coming out/in
  relatedPlayer?: PlayerBasicInfo;

  // Time
  period: number; // Which half/quarter/set
  minute: number;
  extraMinute?: number; // For added time: 90+3 -> minute: 90, extraMinute: 3

  // Additional information
  description?: string;

  // Metadata
  createdAt: Date;
  createdBy: string; // Admin ID who logged the event
  updatedAt?: Date;
  updatedBy?: string;
}

/**
 * DTO for creating an event
 */
export interface CreateEventDto {
  type: string;
  playerId: string;
  teamId: string;
  period: number;
  minute: number;
  extraMinute?: number;
  relatedPlayerId?: string;
  description?: string;
}

/**
 * DTO for updating an event
 */
export interface UpdateEventDto {
  type?: string;
  playerId?: string;
  period?: number;
  minute?: number;
  extraMinute?: number;
  relatedPlayerId?: string;
  description?: string;
}

/**
 * Event for display in timeline
 */
export interface EventTimelineItem {
  id: string;
  type: string;
  typeLabel: string;
  typeIcon: string;
  typeColor: string;
  minute: string; // Formatted: "45'" or "90+3'"
  player: PlayerBasicInfo;
  team: TeamBasicInfo;
  relatedPlayer?: PlayerBasicInfo;
  description?: string;
  isHomeTeam: boolean;
}

/**
 * Format event minute for display
 */
export function formatEventMinute(minute: number, extraMinute?: number): string {
  if (extraMinute && extraMinute > 0) {
    return `${minute}+${extraMinute}'`;
  }
  return `${minute}'`;
}

