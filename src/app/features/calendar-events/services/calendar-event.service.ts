import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CalendarEvent, CalendarEventFormData } from '../models/calendar-event.model';

interface PaginatedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'events';

  getAll(): Observable<CalendarEvent[]> {
    return this.http.get<PaginatedResponse<CalendarEvent>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getById(id: string): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/${id}`);
  }

  create(event: CalendarEventFormData): Observable<CalendarEvent> {
    const payload = {
      ...event,
      type: Number(event.type)
    };
    return this.http.post<CalendarEvent>(this.apiUrl, payload);
  }

  update(event: CalendarEvent): Observable<CalendarEvent> {
    const payload = {
      ...event,
      type: Number(event.type)
    };
    return this.http.put<CalendarEvent>(this.apiUrl, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
