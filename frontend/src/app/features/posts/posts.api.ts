import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { CreatePostRequest, Post, UpdatePostRequest } from '../../core/models/post.models';

@Injectable({ providedIn: 'root' })
export class PostsApi {
  constructor(private readonly http: HttpClient) {}

  getPublished(): Observable<Post[]> {
    return this.http.get<Post[]>(`${API_BASE_URL}/posts`);
  }

  getBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${API_BASE_URL}/posts/${slug}`);
  }

  create(request: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${API_BASE_URL}/posts`, request);
  }

  update(id: string, request: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${API_BASE_URL}/posts/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/posts/${id}`);
  }
}
