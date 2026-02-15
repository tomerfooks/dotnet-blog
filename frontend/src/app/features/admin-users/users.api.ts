import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { UpdateUserRoleRequest, UserListItem } from '../../core/models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${API_BASE_URL}/users`);
  }

  updateRole(id: string, request: UpdateUserRoleRequest): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`${API_BASE_URL}/users/${id}/role`, request);
  }
}
