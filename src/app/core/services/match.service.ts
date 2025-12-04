import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Match, UpdateMatchDto, UpdateMatchScoreDto } from '../models/match.model';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private api = inject(ApiService);

  /**
   * Get all matches for a championship
   */
  getMatches(championshipId: string): Observable<Match[]> {
    return this.api.get<Match[]>('matches', { championshipId }).pipe(
      map((matches) => matches.map((m) => this.parseMatchDates(m))),
      catchError((error) => this.handleError('Error fetching matches', error)),
    );
  }

  /**
   * Get matches by date (format: YYYY-MM-DD)
   */
  getMatchesByDate(date: string, championshipId?: string): Observable<Match[]> {
    const params: any = { date };
    if (championshipId) {
      params.championshipId = championshipId;
    }
    return this.api.get<Match[]>('matches', params).pipe(
      map((matches) => matches.map((m) => this.parseMatchDates(m))),
      catchError((error) => this.handleError('Error fetching matches by date', error)),
    );
  }

  /**
   * Get a single match by ID
   */
  getMatchById(id: string): Observable<Match> {
    return this.api.get<Match>(`matches/${id}`).pipe(
      map((match) => this.parseMatchDates(match)),
      catchError((error) => this.handleError('Error fetching match', error)),
    );
  }

  /**
   * Get matches for an organization
   */
  getMatchesByOrganization(organizationId: string): Observable<Match[]> {
    return this.api.get<Match[]>('matches', { organizationId }).pipe(
      map((matches) => matches.map((m) => this.parseMatchDates(m))),
      catchError((error) => this.handleError('Error fetching organization matches', error)),
    );
  }

  /**
   * Get live matches
   */
  getLiveMatches(organizationId?: string): Observable<Match[]> {
    const params: any = { status: 'live' };
    if (organizationId) {
      params.organizationId = organizationId;
    }
    return this.api.get<Match[]>('matches', params).pipe(
      map((matches) => matches.map((m) => this.parseMatchDates(m))),
      catchError((error) => this.handleError('Error fetching live matches', error)),
    );
  }

  /**
   * Create a new match
   */
  createMatch(match: Partial<Match>): Observable<Match> {
    return this.api.post<Match>('matches', match).pipe(
      map((m) => this.parseMatchDates(m)),
      catchError((error) => this.handleError('Error creating match', error)),
    );
  }

  /**
   * Update match details
   */
  updateMatch(id: string, match: UpdateMatchDto): Observable<Match> {
    return this.api.patch<Match>(`matches/${id}`, match).pipe(
      map((m) => this.parseMatchDates(m)),
      catchError((error) => this.handleError('Error updating match', error)),
    );
  }

  /**
   * Update match score (for live control)
   */
  updateMatchScore(id: string, score: UpdateMatchScoreDto): Observable<Match> {
    return this.api.patch<Match>(`matches/${id}`, score).pipe(
      map((m) => this.parseMatchDates(m)),
      catchError((error) => this.handleError('Error updating match score', error)),
    );
  }

  /**
   * Delete a match
   */
  deleteMatch(id: string): Observable<void> {
    return this.api
      .delete<void>(`matches/${id}`)
      .pipe(catchError((error) => this.handleError('Error deleting match', error)));
  }

  /**
   * Get match with populated team data
   */
  getMatchWithTeams(id: string): Observable<Match> {
    return this.getMatchById(id).pipe(
      map((match) => {
        // In a real backend, teams would be populated
        // For now, we'll need to fetch teams separately if needed
        return match;
      }),
    );
  }

  /**
   * Parse date strings to Date objects
   */
  private parseMatchDates(match: Match): Match {
    if (match.scheduledDate && typeof match.scheduledDate === 'string') {
      match.scheduledDate = new Date(match.scheduledDate);
    }
    if (match.actualStartTime && typeof match.actualStartTime === 'string') {
      match.actualStartTime = new Date(match.actualStartTime);
    }
    if (match.actualEndTime && typeof match.actualEndTime === 'string') {
      match.actualEndTime = new Date(match.actualEndTime);
    }
    if (match.createdAt && typeof match.createdAt === 'string') {
      match.createdAt = new Date(match.createdAt);
    }
    if (match.updatedAt && typeof match.updatedAt === 'string') {
      match.updatedAt = new Date(match.updatedAt);
    }
    return match;
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => new Error(`${message}: ${error.message || error}`));
  }
}
