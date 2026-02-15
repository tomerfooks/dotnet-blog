import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApi } from '../users.api';
import { UserListItem } from '../../../core/models/user.models';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Admin · Users</h1>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <div class="table-wrap" *ngIf="users.length">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.email }}</td>
              <td>
                <select [value]="toRoleValue(user.role)" (change)="setRole(user, $event)">
                  <option value="guest">Guest</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{{ user.createdAtUtc | date: 'short' }}</td>
              <td>{{ user.updatedAtUtc | date: 'short' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AdminUsersPage implements OnInit {
  users: UserListItem[] = [];
  errorMessage = '';

  constructor(private readonly usersApi: UsersApi) {}

  ngOnInit(): void {
    this.reload();
  }

  toRoleValue(role: UserListItem['role']): 'guest' | 'editor' | 'admin' {
    switch (role) {
      case 'Admin':
        return 'admin';
      case 'Editor':
        return 'editor';
      default:
        return 'guest';
    }
  }

  setRole(user: UserListItem, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const role = target.value as 'guest' | 'editor' | 'admin';

    this.usersApi.updateRole(user.id, { role }).subscribe({
      next: (updated) => {
        this.users = this.users.map((item) => (item.id === user.id ? updated : item));
      },
      error: (error) => {
        this.errorMessage = extractErrorMessage(error);
        target.value = this.toRoleValue(user.role);
      }
    });
  }

  private reload(): void {
    this.usersApi.getAll().subscribe({
      next: (users) => (this.users = users),
      error: (error) => (this.errorMessage = extractErrorMessage(error))
    });
  }
}
