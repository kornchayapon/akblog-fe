import type { Picture } from './picture';

export interface CommentUser {
  id: number;
  firstName: string;
  lastName: string | null;
  avatar?: Picture | null;
  socialAcc?: boolean;
  socialAvatarUrl?: string | null;
}

/** Nested parent comment returned on `Comment.parentId` (API shape). */
export interface CommentParentRef {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isReply: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: CommentParentRef | null;
  isReply: boolean;
  user: CommentUser;
}
