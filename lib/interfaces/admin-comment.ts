export type AdminCommentUser = Readonly<{
  id: number;
  firstName: string;
  lastName: string | null;
}>;

export type AdminCommentParentRef = Readonly<{
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isReply: boolean;
  user: AdminCommentUser;
}>;

export type AdminComment = Readonly<{
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  parentId: AdminCommentParentRef | null;
  isReply: boolean;
  user: AdminCommentUser;
  replyUser?: AdminCommentUser | null;
  /** Backend-provided slug used to link to public blog detail page. */
  blogSlug?: string | null;
}>;

export type AdminCommentsLinks = Readonly<{
  first: string;
  last: string;
  current: string;
  next: string | null;
  previous: string | null;
}>;

export type AdminCommentsMeta = Readonly<{
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}>;

export type AdminCommentsResponse = Readonly<{
  results: AdminComment[];
  meta: AdminCommentsMeta;
  links: AdminCommentsLinks;
}>;
