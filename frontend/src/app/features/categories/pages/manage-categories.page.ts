import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesApi } from '../categories.api';
import { Category } from '../../../core/models/category.models';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-manage-categories-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section>
      <h1>Manage categories</h1>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <form [formGroup]="form" (ngSubmit)="save()" class="stack card">
        <h2>{{ selected ? 'Edit category' : 'New category' }}</h2>
        <label>
          Name
          <input formControlName="name" />
        </label>
        <small class="error" *ngIf="showError('name')">Name is required (max 120).</small>

        <label>
          Slug
          <input formControlName="slug" />
        </label>
        <small class="error" *ngIf="showError('slug')">Slug is required (max 160).</small>

        <div class="cluster">
          <button type="submit">{{ selected ? 'Update' : 'Create' }}</button>
          <button type="button" class="secondary" (click)="resetForm()">Reset</button>
        </div>
      </form>

      <div class="table-wrap" *ngIf="categories.length">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories">
              <td>{{ category.name }}</td>
              <td>{{ category.slug }}</td>
              <td class="actions">
                <button type="button" (click)="edit(category)">Edit</button>
                <button type="button" class="danger" (click)="remove(category)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class ManageCategoriesPage implements OnInit {
  categories: Category[] = [];
  selected: Category | null = null;
  errorMessage = '';
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    slug: ['', [Validators.required, Validators.maxLength(160)]]
  });

  constructor(private readonly categoriesApi: CategoriesApi) {}

  ngOnInit(): void {
    this.reload();
  }

  showError(name: 'name' | 'slug'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.selected) {
      this.categoriesApi
        .update(this.selected.id, {
          name: value.name ?? '',
          slug: value.slug ?? ''
        })
        .subscribe({
          next: () => {
            this.resetForm();
            this.reload();
          },
          error: (error) => (this.errorMessage = extractErrorMessage(error))
        });
      return;
    }

    this.categoriesApi
      .create({
        name: value.name ?? '',
        slug: value.slug ?? ''
      })
      .subscribe({
        next: () => {
          this.resetForm();
          this.reload();
        },
        error: (error) => (this.errorMessage = extractErrorMessage(error))
      });
  }

  edit(category: Category): void {
    this.selected = category;
    this.form.patchValue({ name: category.name, slug: category.slug });
  }

  remove(category: Category): void {
    if (!confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    this.categoriesApi.delete(category.id).subscribe({
      next: () => this.reload(),
      error: (error) => (this.errorMessage = extractErrorMessage(error))
    });
  }

  resetForm(): void {
    this.selected = null;
    this.form.reset({ name: '', slug: '' });
  }

  private reload(): void {
    this.categoriesApi.getAll().subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => (this.errorMessage = extractErrorMessage(error))
    });
  }
}
