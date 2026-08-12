import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent, CalendarEventFormData } from '../models/calendar-event.model';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'events';

  getAll(): Observable<PagedApiResponse<CalendarEvent>> {
    return this.http.get<PagedApiResponse<CalendarEvent>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<CalendarEvent>> {
    return this.http.get<ApiResponse<CalendarEvent>>(`${this.apiUrl}/${id}`);
  }

  create(event: CalendarEventFormData): Observable<ApiResponse<CalendarEvent>> {
    const payload = {
      ...event,
      type: Number(event.type)
    };
    return this.http.post<ApiResponse<CalendarEvent>>(this.apiUrl, payload);
  }

  update(event: CalendarEvent): Observable<ApiResponse<CalendarEvent>> {
    const payload = {
      ...event,
      type: Number(event.type)
    };
    return this.http.put<ApiResponse<CalendarEvent>>(this.apiUrl, payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
