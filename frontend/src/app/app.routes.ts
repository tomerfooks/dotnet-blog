import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { SigninPage } from './features/auth/pages/signin.page';
import { SignupPage } from './features/auth/pages/signup.page';
import { PostListPage } from './features/posts/pages/post-list.page';
import { PostDetailsPage } from './features/posts/pages/post-details.page';
import { ManagePostsPage } from './features/posts/pages/manage-posts.page';
import { PostEditorPage } from './features/posts/pages/post-editor.page';
import { ManageCategoriesPage } from './features/categories/pages/manage-categories.page';
import { AdminUsersPage } from './features/admin-users/pages/admin-users.page';

export const routes: Routes = [
	{ path: '', component: PostListPage },
	{ path: 'post/:slug', component: PostDetailsPage },
	{ path: 'signin', component: SigninPage },
	{ path: 'signup', component: SignupPage },
	{
		path: 'manage/posts',
		component: ManagePostsPage,
		canActivate: [authGuard, roleGuard],
		data: { roles: ['Editor', 'Admin'] }
	},
	{
		path: 'manage/posts/new',
		component: PostEditorPage,
		canActivate: [authGuard, roleGuard],
		data: { roles: ['Editor', 'Admin'] }
	},
	{
		path: 'manage/posts/:id/edit',
		component: PostEditorPage,
		canActivate: [authGuard, roleGuard],
		data: { roles: ['Editor', 'Admin'] }
	},
	{
		path: 'manage/categories',
		component: ManageCategoriesPage,
		canActivate: [authGuard, roleGuard],
		data: { roles: ['Editor', 'Admin'] }
	},
	{
		path: 'admin/users',
		component: AdminUsersPage,
		canActivate: [authGuard, roleGuard],
		data: { roles: ['Admin'] }
	},
	{ path: '**', redirectTo: '' }
];
