import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../../core/models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  create(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${API_BASE_URL}/categories`, request);
  }

  update(id: string, request: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${API_BASE_URL}/categories/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/categories/${id}`);
  }
}
