import type { Blog } from './blog';

export type GuestBlogsLinks = Readonly<{
  first: string;
  last: string;
  current: string;
  next: string | null;
  previous: string | null;
}>;

export type GuestBlogsMeta = Readonly<{
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}>;

export type GuestBlogsResponse = Readonly<{
  results: Blog[];
  meta: GuestBlogsMeta;
  links: GuestBlogsLinks;
}>;