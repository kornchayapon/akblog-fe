import type { Comment } from './comment';

export type GuestCommentsLinks = Readonly<{
  first: string;
  last: string;
  current: string;
  next: string | null;
  previous: string | null;
}>;

export type GuestCommentsMeta = Readonly<{
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}>;

export type GuestCommentsResponse = Readonly<{
  results: Comment[];
  meta: GuestCommentsMeta;
  links: GuestCommentsLinks;
}>;

