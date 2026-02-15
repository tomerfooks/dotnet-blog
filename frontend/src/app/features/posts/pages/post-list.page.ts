import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsApi } from '../posts.api';
import { Post } from '../../../core/models/post.models';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-post-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <div class="page-head">
        <h1>Latest posts</h1>
      </div>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="muted" *ngIf="loading">Loading posts...</p>
      <p class="muted" *ngIf="!loading && !errorMessage && posts.length === 0">No published posts yet.</p>

      <div class="posts-grid" *ngIf="posts.length">
        <article class="card" *ngFor="let post of posts">
          <h2>{{ post.title }}</h2>
          <p class="muted">{{ post.publishedAtUtc ? (post.publishedAtUtc | date: 'medium') : 'Draft' }}</p>
          <p>{{ preview(post.content) }}</p>
          <a [routerLink]="['/post', post.slug]">Read more</a>
        </article>
      </div>
    </section>
  `
})
export class PostListPage implements OnInit {
  posts: Post[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly postsApi: PostsApi) {}

  ngOnInit(): void {
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

  preview(content: string): string {
    return content.length > 140 ? `${content.slice(0, 140)}...` : content;
  }
}
