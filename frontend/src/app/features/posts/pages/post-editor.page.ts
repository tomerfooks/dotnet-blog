import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { extractErrorMessage } from '../../../core/api/problem-details';
import { Category } from '../../../core/models/category.models';
import { Post } from '../../../core/models/post.models';
import { CategoriesApi } from '../../categories/categories.api';
import { PostsApi } from '../posts.api';

@Component({
  selector: 'app-post-editor-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section>
      <div class="page-head">
        <h1>{{ isEditMode ? 'Edit post' : 'New post' }}</h1>
      </div>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="muted" *ngIf="isEditMode && !editablePost">Open this page from the manage list to edit a post.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="stack" *ngIf="!isEditMode || editablePost">
        <label>
          Title
          <input formControlName="title" />
        </label>
        <small class="error" *ngIf="showError('title')">Title is required (max 200).</small>

        <label>
          Slug
          <input formControlName="slug" />
        </label>
        <small class="error" *ngIf="showError('slug')">Slug is required (max 240).</small>

        <label>
          Category
          <select formControlName="categoryId">
            <option value="">Select category</option>
            <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
          </select>
        </label>

        <label>
          Content
          <textarea rows="10" formControlName="content"></textarea>
        </label>
        <small class="error" *ngIf="showError('content')">Content is required.</small>

        <label class="inline">
          <input type="checkbox" formControlName="publish" />
          Publish now
        </label>

        <div class="cluster">
          <button type="submit" [disabled]="loading">{{ loading ? 'Saving...' : 'Save post' }}</button>
          <button type="button" class="secondary" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </section>
  `
})
export class PostEditorPage implements OnInit {
  categories: Category[] = [];
  loading = false;
  errorMessage = '';
  isEditMode = false;
  editablePost: Post | null = null;
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    slug: ['', [Validators.required, Validators.maxLength(240)]],
    categoryId: ['', [Validators.required]],
    content: ['', [Validators.required]],
    publish: [true]
  });

  constructor(
    private readonly categoriesApi: CategoriesApi,
    private readonly postsApi: PostsApi,
    private readonly authState: AuthStateService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.categoriesApi.getAll().subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => (this.errorMessage = extractErrorMessage(error))
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (id) {
      const navState = history.state as { post?: Post };
      if (navState?.post?.id === id) {
        this.editablePost = navState.post;
        this.form.patchValue({
          title: navState.post.title,
          slug: navState.post.slug,
          categoryId: navState.post.categoryId,
          content: navState.post.content,
          publish: navState.post.status === 'Published'
        });
      }
    }
  }

  showError(name: 'title' | 'slug' | 'content'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const value = this.form.getRawValue();

    if (this.isEditMode && this.editablePost) {
      this.postsApi
        .update(this.editablePost.id, {
          title: value.title ?? '',
          slug: value.slug ?? '',
          content: value.content ?? '',
          categoryId: value.categoryId ?? '',
          publish: !!value.publish
        })
        .subscribe({
          next: () => this.router.navigateByUrl('/manage/posts'),
          error: (error) => {
            this.errorMessage = extractErrorMessage(error);
            this.loading = false;
          }
        });
      return;
    }

    const userId = this.authState.user()?.id;
    if (!userId) {
      this.errorMessage = 'No authenticated user id found in token.';
      this.loading = false;
      return;
    }

    this.postsApi
      .create({
        title: value.title ?? '',
        slug: value.slug ?? '',
        content: value.content ?? '',
        categoryId: value.categoryId ?? '',
        authorId: userId,
        publish: !!value.publish
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/manage/posts'),
        error: (error) => {
          this.errorMessage = extractErrorMessage(error);
          this.loading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigateByUrl('/manage/posts');
  }
}
