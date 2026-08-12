import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface ProfileData {
  id: number;
  fullName: string;
  email: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  newPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + 'identity/users/me';

  getOwnProfile(): Observable<ApiResponse<ProfileData>> {
    return this.http.get<ApiResponse<ProfileData>>(this.baseUrl);
  }

  updateOwnProfile(data: UpdateProfileRequest): Observable<ApiResponse<ProfileData>> {
    return this.http.put<ApiResponse<ProfileData>>(this.baseUrl, data);
  }
}
