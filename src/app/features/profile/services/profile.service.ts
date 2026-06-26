import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

  getOwnProfile(): Observable<ProfileData> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => res.data)
    );
  }

  updateOwnProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put<any>(this.baseUrl, data);
  }
}
