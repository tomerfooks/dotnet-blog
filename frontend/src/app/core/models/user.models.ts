export interface UserListItem {
  id: string;
  email: string;
  role: 'Guest' | 'Editor' | 'Admin';
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface UpdateUserRoleRequest {
  role: 'guest' | 'editor' | 'admin';
}
