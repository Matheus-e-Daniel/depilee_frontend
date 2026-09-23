import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HomeWidget } from '../models/home-widget.model';

export interface HomeWidgetPreferences {
  configured: boolean;
  widgets: HomeWidget[];
}

@Injectable({ providedIn: 'root' })
export class HomeWidgetPreferenceService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + 'identity/me/home-widgets';

  get(): Observable<ApiResponse<HomeWidget[]>> {
    return this.http.get<ApiResponse<HomeWidget[]>>(this.baseUrl);
  }

  getPreferences(): Observable<HomeWidgetPreferences> {
    return this.get().pipe(
      map(({ data }) => ({
        configured: data.length > 0,
        widgets: data.filter(w => w !== HomeWidget.None)
      }))
    );
  }

  update(widgets: HomeWidget[]): Observable<ApiResponse<HomeWidget[]>> {
    return this.http.put<ApiResponse<HomeWidget[]>>(this.baseUrl, { widgets });
  }
}
