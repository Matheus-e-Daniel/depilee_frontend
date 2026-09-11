import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedApiResponse } from '../../../core/models/api-response.model';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notificationType: number;
  notificationStatus: number;
  createdAt: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + 'notifications';

  getAll(pageNumber = 1, pageSize = 10, onlyUnread?: boolean): Observable<PagedApiResponse<Notification>> {
    let params: Record<string, string> = { pageNumber: String(pageNumber), pageSize: String(pageSize) };
    if (onlyUnread !== undefined) {
      params = { ...params, onlyUnread: String(onlyUnread) };
    }
    return this.http.get<PagedApiResponse<Notification>>(this.apiUrl, { params });
  }

  markAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/mark-as-read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/mark-all-as-read`, {});
  }

}
