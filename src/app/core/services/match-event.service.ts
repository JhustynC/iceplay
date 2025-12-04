import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, interval, switchMap, startWith, catchError, throwError, map } from 'rxjs';
import { MatchEvent, CreateEventDto, UpdateEventDto } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class MatchEventService {
  private api = inject(ApiService);
  private readonly POLLING_INTERVAL = 3000; // 3 seconds

  /**
   * Get all events for a match
   */
  getMatchEvents(matchId: string): Observable<MatchEvent[]> {
    return this.api.get<MatchEvent[]>('events', { matchId }).pipe(
      map((events) => events.map((e) => this.parseEventDates(e))),
      catchError((error) => this.handleError('Error fetching match events', error))
    );
  }

  /**
   * Get events with polling for live matches
   * Polls every 3 seconds when match is live
   */
  getMatchEventsWithPolling(matchId: string, isLive: boolean): Observable<MatchEvent[]> {
    if (!isLive) {
      // Return single fetch if not live
      return this.getMatchEvents(matchId);
    }

    // Poll every 3 seconds when live
    return interval(this.POLLING_INTERVAL).pipe(
      startWith(0), // Start immediately
      switchMap(() => this.getMatchEvents(matchId)),
      catchError((error) => {
        console.error('Error polling match events', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new match event
   */
  createEvent(event: CreateEventDto & { matchId: string; championshipId: string }): Observable<MatchEvent> {
    return this.api.post<MatchEvent>('events', event).pipe(
      map((e) => this.parseEventDates(e)),
      catchError((error) => this.handleError('Error creating event', error))
    );
  }

  /**
   * Update an event
   */
  updateEvent(id: string, event: UpdateEventDto): Observable<MatchEvent> {
    return this.api.patch<MatchEvent>(`events/${id}`, event).pipe(
      map((e) => this.parseEventDates(e)),
      catchError((error) => this.handleError('Error updating event', error))
    );
  }

  /**
   * Delete an event
   */
  deleteEvent(id: string): Observable<void> {
    return this.api.delete<void>(`events/${id}`).pipe(
      catchError((error) => this.handleError('Error deleting event', error))
    );
  }

  /**
   * Get event by ID
   */
  getEventById(id: string): Observable<MatchEvent> {
    return this.api.get<MatchEvent>(`events/${id}`).pipe(
      map((e) => this.parseEventDates(e)),
      catchError((error) => this.handleError('Error fetching event', error))
    );
  }

  /**
   * Parse date strings to Date objects
   */
  private parseEventDates(event: MatchEvent): MatchEvent {
    if (event.createdAt && typeof event.createdAt === 'string') {
      event.createdAt = new Date(event.createdAt);
    }
    if (event.updatedAt && typeof event.updatedAt === 'string') {
      event.updatedAt = new Date(event.updatedAt);
    }
    return event;
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => new Error(`${message}: ${error.message || error}`));
  }
}

