import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Championship } from '../models/championship.model';

@Injectable({
  providedIn: 'root',
})
export class ChampionshipService {
  private api = inject(ApiService);

  getChampionships(organizationId?: string): Observable<Championship[]> {
    const params = organizationId ? { organizationId } : {};
    return this.api.get<Championship[]>('championships', params).pipe(
      map((championships) => championships.map((c) => this.parseChampionshipDates(c))),
      catchError((error) => this.handleError('Error fetching championships', error)),
    );
  }

  /**
   * Get all active championships (for public view)
   */
  getActiveChampionships(): Observable<Championship[]> {
    return this.api.get<Championship[]>('championships', { status: 'active' }).pipe(
      map((championships) => championships.map((c) => this.parseChampionshipDates(c))),
      catchError((error) => this.handleError('Error fetching active championships', error)),
    );
  }

  getChampionshipById(id: string): Observable<Championship> {
    return this.api.get<Championship>(`championships/${id}`).pipe(
      map((championship) => this.parseChampionshipDates(championship)),
      catchError((error) => this.handleError('Error fetching championship', error)),
    );
  }

  createChampionship(championship: Partial<Championship>): Observable<Championship> {
    return this.api.post<Championship>('championships', championship).pipe(
      map((c) => this.parseChampionshipDates(c)),
      catchError((error) => this.handleError('Error creating championship', error)),
    );
  }

  updateChampionship(id: string, championship: Partial<Championship>): Observable<Championship> {
    return this.api.patch<Championship>(`championships/${id}`, championship).pipe(
      map((c) => this.parseChampionshipDates(c)),
      catchError((error) => this.handleError('Error updating championship', error)),
    );
  }

  deleteChampionship(id: string): Observable<void> {
    return this.api
      .delete<void>(`championships/${id}`)
      .pipe(catchError((error) => this.handleError('Error deleting championship', error)));
  }

  /**
   * Parse date strings to Date objects
   */
  private parseChampionshipDates(championship: Championship): Championship {
    if (championship.startDate && typeof championship.startDate === 'string') {
      championship.startDate = new Date(championship.startDate);
    }
    if (championship.endDate && typeof championship.endDate === 'string') {
      championship.endDate = new Date(championship.endDate);
    }
    if (
      championship.registrationStartDate &&
      typeof championship.registrationStartDate === 'string'
    ) {
      championship.registrationStartDate = new Date(championship.registrationStartDate);
    }
    if (championship.registrationEndDate && typeof championship.registrationEndDate === 'string') {
      championship.registrationEndDate = new Date(championship.registrationEndDate);
    }
    if (championship.createdAt && typeof championship.createdAt === 'string') {
      championship.createdAt = new Date(championship.createdAt);
    }
    if (championship.updatedAt && typeof championship.updatedAt === 'string') {
      championship.updatedAt = new Date(championship.updatedAt);
    }
    return championship;
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => new Error(`${message}: ${error.message || error}`));
  }
}
