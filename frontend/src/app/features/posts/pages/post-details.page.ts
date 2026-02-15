import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsApi } from '../posts.api';
import { Post } from '../../../core/models/post.models';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-post-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <a routerLink="/" class="muted">← Back to posts</a>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="muted" *ngIf="loading">Loading post...</p>

      <article *ngIf="post" class="article">
        <h1>{{ post.title }}</h1>
        <p class="muted">{{ post.publishedAtUtc ? (post.publishedAtUtc | date: 'medium') : 'Draft' }}</p>
        <p class="content">{{ post.content }}</p>
      </article>
    </section>
  `
})
export class PostDetailsPage implements OnInit {
  post: Post | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly postsApi: PostsApi
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.errorMessage = 'Post slug is missing.';
      this.loading = false;
      return;
    }

    this.postsApi.getBySlug(slug).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = extractErrorMessage(error);
        this.loading = false;
      }
    });
  }
}
