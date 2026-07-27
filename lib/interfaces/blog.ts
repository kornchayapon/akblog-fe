import type { Picture } from './picture';

export interface BlogAuthor {
  id: number;
  firstName: string;
  lastName: string | null;
  avatar?: Picture | null;
}

export interface BlogTag {
  id: number;
  slug: string;
  name: string;
}

export interface BlogPicture {
  id: number;
  name: string;
  path: string;
  size: number;
  createAt: string;
  updateAt: string;
}

export interface BlogThumbnail {
  id: number;
  name: string;
  path: string;
  size: number;
  createAt: string;
  updateAt: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  publishedOn: string | null;
  status: 'draft' | 'published' | string;
  createdAt: string;
  updatedAt: string;
  author: BlogAuthor;
  category: BlogCategory;
  tags: BlogTag[];
  thumbnail: BlogThumbnail | null;
  pictures: BlogPicture[];
}