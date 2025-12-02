/**
 * Team entity
 */
export interface Team {
  id: string;
  championshipId: string;
  organizationId: string; // Denormalized for queries
  name: string;
  shortName: string; // "FCB", "RMA"
  slug: string;
  logo?: string;
  coverImage?: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;

  // Information
  foundedYear?: number;
  homeVenue?: string;
  city?: string;

  // Contact
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;

  // State
  isActive: boolean;
  hasActiveMatches: boolean; // Prevents deletion if has matches

  // Summary statistics (denormalized)
  playersCount: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new team
 */
export interface CreateTeamDto {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  homeVenue?: string;
  city?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
}

/**
 * DTO for updating a team
 */
export interface UpdateTeamDto {
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  city?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  isActive?: boolean;
}

/**
 * Team with players for detailed views
 */
export interface TeamWithPlayers extends Team {
  players: import('./player.model').Player[];
}

/**
 * Simplified team info for dropdowns and lists
 */
export interface TeamBasicInfo {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  primaryColor: string;
}

