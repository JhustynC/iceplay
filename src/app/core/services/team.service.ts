import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, forkJoin, of, from, throwError } from 'rxjs';
import { map, switchMap, mergeMap, toArray, catchError, tap } from 'rxjs/operators';
import { Team, CreateTeamDto, UpdateTeamDto, TeamWithPlayers } from '../models/team.model';
import { Player, CreatePlayerDto } from '../models/player.model';

export interface CsvImportResult {
  teamsImported: number;
  playersImported: number;
  teamsSkipped: string[];
  playersSkipped: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private api = inject(ApiService);

  /**
   * Get all teams for a championship
   */
  getTeams(championshipId: string): Observable<Team[]> {
    return this.api.get<Team[]>('teams', { championshipId }).pipe(
      map((teams) => teams.map((t) => this.parseTeamDates(t))),
      catchError((error) => this.handleError('Error fetching teams', error)),
    );
  }

  /**
   * Get teams by organization
   */
  getTeamsByOrganization(organizationId: string): Observable<Team[]> {
    return this.api.get<Team[]>('teams', { organizationId }).pipe(
      map((teams) => teams.map((t) => this.parseTeamDates(t))),
      catchError((error) => this.handleError('Error fetching organization teams', error)),
    );
  }

  /**
   * Get a single team by ID
   */
  getTeamById(id: string): Observable<Team> {
    return this.api.get<Team>(`teams/${id}`).pipe(
      map((team) => this.parseTeamDates(team)),
      catchError((error) => this.handleError('Error fetching team', error)),
    );
  }

  /**
   * Get team with players
   */
  getTeamWithPlayers(id: string): Observable<TeamWithPlayers> {
    return forkJoin({
      team: this.getTeamById(id),
      players: this.getPlayers(id),
    }).pipe(
      map(({ team, players }) => ({
        ...team,
        players,
      })),
      catchError((error) => this.handleError('Error fetching team with players', error)),
    );
  }

  /**
   * Create a new team
   */
  createTeam(
    team: CreateTeamDto & { championshipId: string; organizationId: string },
  ): Observable<Team> {
    return this.api.post<Team>('teams', team).pipe(
      map((t) => this.parseTeamDates(t)),
      catchError((error) => this.handleError('Error creating team', error)),
    );
  }

  /**
   * Update a team
   */
  updateTeam(id: string, team: UpdateTeamDto): Observable<Team> {
    return this.api.patch<Team>(`teams/${id}`, team).pipe(
      map((t) => this.parseTeamDates(t)),
      catchError((error) => this.handleError('Error updating team', error)),
    );
  }

  /**
   * Delete a team
   */
  deleteTeam(id: string): Observable<void> {
    return this.api
      .delete<void>(`teams/${id}`)
      .pipe(catchError((error) => this.handleError('Error deleting team', error)));
  }

  /**
   * Get players for a team
   */
  getPlayers(teamId: string): Observable<Player[]> {
    return this.api.get<Player[]>('players', { teamId }).pipe(
      map((players) => players.map((p) => this.parsePlayerDates(p))),
      catchError((error) => this.handleError('Error fetching players', error)),
    );
  }

  /**
   * Create a player
   */
  createPlayer(
    player: CreatePlayerDto & { teamId: string; championshipId: string; organizationId: string },
  ): Observable<Player> {
    return this.api.post<Player>('players', player).pipe(
      map((p) => this.parsePlayerDates(p)),
      catchError((error) => this.handleError('Error creating player', error)),
    );
  }

  /**
   * Parse date strings to Date objects for Team
   */
  private parseTeamDates(team: Team): Team {
    if (team.createdAt && typeof team.createdAt === 'string') {
      team.createdAt = new Date(team.createdAt);
    }
    if (team.updatedAt && typeof team.updatedAt === 'string') {
      team.updatedAt = new Date(team.updatedAt);
    }
    return team;
  }

  /**
   * Parse date strings to Date objects for Player
   */
  private parsePlayerDates(player: Player): Player {
    if (player.birthDate && typeof player.birthDate === 'string') {
      player.birthDate = new Date(player.birthDate);
    }
    if (player.suspensionEndDate && typeof player.suspensionEndDate === 'string') {
      player.suspensionEndDate = new Date(player.suspensionEndDate);
    }
    if (player.createdAt && typeof player.createdAt === 'string') {
      player.createdAt = new Date(player.createdAt);
    }
    if (player.updatedAt && typeof player.updatedAt === 'string') {
      player.updatedAt = new Date(player.updatedAt);
    }
    return player;
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => new Error(`${message}: ${error.message || error}`));
  }

  // Simulated CSV Import
  importFromCsv(
    championshipId: string,
    organizationId: string,
    csvContent: string,
  ): Observable<CsvImportResult> {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).filter((line) => line.trim() !== '');

    const result: CsvImportResult = {
      teamsImported: 0,
      playersImported: 0,
      teamsSkipped: [],
      playersSkipped: [],
      warnings: [],
    };

    // This is a simplified simulation. In a real app, we'd need robust parsing.
    // We'll assume the CSV columns match the requirement:
    // team_name, short_name, coach, category, group, player_firstname, player_lastname, player_document, player_number, player_position

    return from(data).pipe(
      mergeMap((line) => {
        const cols = line.split(',');
        const teamName = cols[0]?.trim();

        if (!teamName) return of(null);

        // Check if team exists
        return this.api.get<Team[]>('teams', { name: teamName, championshipId }).pipe(
          switchMap((teams) => {
            let teamObs: Observable<Team>;
            if (teams.length > 0) {
              teamObs = of(teams[0]);
            } else {
              // Create new team
              const newTeam: CreateTeamDto & { championshipId: string; organizationId: string } = {
                championshipId,
                organizationId,
                name: teamName,
                shortName: cols[1]?.trim() || teamName.substring(0, 3).toUpperCase(),
                primaryColor: '#1e40af',
                secondaryColor: '#ffffff',
                logo: 'https://via.placeholder.com/50',
                managerName: cols[2]?.trim() || '',
                city: cols[3]?.trim() || '',
              };
              teamObs = this.createTeam(newTeam).pipe(tap(() => result.teamsImported++));
            }

            return teamObs.pipe(
              switchMap((team) => {
                // Create player
                const playerDoc = cols[7]?.trim();
                if (!playerDoc) return of(null);

                // Check for duplicate player by document
                return this.api.get<Player[]>('players', { document: playerDoc }).pipe(
                  switchMap((existingPlayers) => {
                    if (existingPlayers.length > 0) {
                      result.warnings.push(`Documento duplicado: ${playerDoc}`);
                      result.playersSkipped.push(playerDoc);
                      return of(null);
                    }

                    const newPlayer: CreatePlayerDto & {
                      teamId: string;
                      championshipId: string;
                      organizationId: string;
                    } = {
                      teamId: team.id,
                      championshipId,
                      organizationId,
                      firstName: cols[5]?.trim() || '',
                      lastName: cols[6]?.trim() || '',
                      number: parseInt(cols[8]?.trim() || '0', 10),
                      position: cols[9]?.trim() || 'Player',
                    };
                    return this.createPlayer(newPlayer).pipe(tap(() => result.playersImported++));
                  }),
                );
              }),
            );
          }),
        );
      }),
      toArray(),
      map(() => result),
    );
  }
}
