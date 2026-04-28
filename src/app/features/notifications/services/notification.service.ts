import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Notification {
  id: number;
  label: string;
  icon: string;
  badge: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'notifications';

  getAll(): Observable<PagedResponse<Notification>> {
    return this.http.get<PagedResponse<Notification>>(this.apiUrl).pipe(
      tap((data) => {
        console.log('Notificações buscadas do backend:', data);
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/mark-as-read`, {});
  }

}
