import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PostsApi } from '../posts.api';
import { Post } from '../../../core/models/post.models';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-manage-posts-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <div class="page-head">
        <h1>Manage posts</h1>
        <a class="button-link" routerLink="/manage/posts/new">New post</a>
      </div>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="muted" *ngIf="loading">Loading posts...</p>

      <div class="table-wrap" *ngIf="!loading && posts.length">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let post of posts">
              <td>{{ post.title }}</td>
              <td>{{ post.status }}</td>
              <td>{{ post.updatedAtUtc | date: 'short' }}</td>
              <td class="actions">
                <button type="button" (click)="edit(post)">Edit</button>
                <button type="button" class="danger" (click)="remove(post)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class ManagePostsPage implements OnInit {
  posts: Post[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private readonly postsApi: PostsApi,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.postsApi.getPublished().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = extractErrorMessage(error);
        this.loading = false;
      }
    });
  }

  edit(post: Post): void {
    this.router.navigate(['/manage/posts', post.id, 'edit'], { state: { post } });
  }

  remove(post: Post): void {
    if (!confirm(`Delete "${post.title}"?`)) {
      return;
    }

    this.postsApi.delete(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((item) => item.id !== post.id);
      },
      error: (error) => {
        this.errorMessage = extractErrorMessage(error);
      }
    });
  }
}
