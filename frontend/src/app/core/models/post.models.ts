export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'Draft' | 'Published';
  publishedAtUtc: string | null;
  authorId: string;
  categoryId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  content: string;
  authorId: string;
  categoryId: string;
  publish: boolean;
}

export interface UpdatePostRequest {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  publish: boolean;
}
