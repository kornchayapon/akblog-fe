'use client';

import { type KeyboardEvent, type ReactElement, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CornerDownRight,
  MessageSquareReply,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  createComment,
  deleteComment,
  updateComment,
} from '@/lib/apis/comments';
import { COMMENT_MAX_LENGTH } from '@/lib/constants/comment';
import { getGuestBlogCommentsQueryKey } from '@/lib/constants/guest-blog-comments-query';
import {
  mergeGuestBlogCommentsInfiniteCache,
  normalizeCommentPayload,
} from '@/lib/functions/merge-guest-blog-comments-cache';
import type { Comment, CommentUser } from '@/lib/interfaces/comment';
import { queryClient } from '@/lib/react-query/query-client';

const editContentSchema = z
  .string()
  .min(1, 'Comment cannot be empty')
  .max(
    COMMENT_MAX_LENGTH,
    `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer`,
  );

type CommentItemProps = Readonly<{
  comment: Comment;
  replyToUser?: CommentUser;
  blogId: number;
  canManage: boolean;
  canReply: boolean;
}>;

function getInitials(firstName: string, lastName: string | null): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName?.charAt(0).toUpperCase() ?? '';
  return `${first}${last}`;
}

function getAvatarColor(userId: number): string {
  const palette = [
    'bg-emerald-100 text-emerald-800',
    'bg-sky-100 text-sky-800',
    'bg-violet-100 text-violet-800',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-800',
    'bg-teal-100 text-teal-800',
  ];
  return palette[userId % palette.length];
}

const CommentItem = ({
  comment,
  replyToUser,
  blogId,
  canManage,
  canReply,
}: CommentItemProps): ReactElement => {
  const { user, content, createdAt, isReply, id } = comment;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const initials = getInitials(user.firstName, user.lastName);
  const avatarColor = getAvatarColor(user.id);
  const avatarSrc = user.socialAcc ? user.socialAvatarUrl : user.avatar?.path;

  console.log('*avatarSrc:', avatarSrc, user);
  

  const replyFullName = replyToUser
    ? [replyToUser.firstName, replyToUser.lastName].filter(Boolean).join(' ')
    : null;

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const editCharCount = editValue.length;
  const editCharNearLimit = editCharCount > COMMENT_MAX_LENGTH * 0.9;
  const replyCharCount = replyDraft.length;
  const replyCharNearLimit = replyCharCount > COMMENT_MAX_LENGTH * 0.9;

  const commentsQueryKey = getGuestBlogCommentsQueryKey(blogId);

  const { mutate: saveEdit, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!canManage) {
        throw new Error('You cannot edit this comment.');
      }
      const parsed = editContentSchema.safeParse(editValue.trim());
      if (!parsed.success) {
        const first = parsed.error.issues[0]?.message ?? 'Invalid comment.';
        throw new Error(first);
      }
      return updateComment({
        commentId: id,
        payload: { content: parsed.data, blog: blogId },
      });
    },
    onSuccess: (data) => {
      toast.success('Comment updated');
      setIsEditing(false);
      const merged =
        normalizeCommentPayload(data as unknown) ?? (data as Comment);
      if (!queryClient.getQueryData(commentsQueryKey)) {
        void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
        return;
      }
      mergeGuestBlogCommentsInfiniteCache(queryClient, commentsQueryKey, {
        type: 'upsert',
        comment: merged,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to update comment.');
    },
  });

  const { mutate: submitReply, isPending: isReplying } = useMutation({
    mutationFn: async () => {
      if (!canReply) {
        throw new Error('Verify your email to post replies.');
      }
      const parsed = editContentSchema.safeParse(replyDraft.trim());
      if (!parsed.success) {
        const first = parsed.error.issues[0]?.message ?? 'Invalid reply.';
        throw new Error(first);
      }
      return createComment({
        payload: {
          content: parsed.data,
          blog: blogId,
          parentId: id,
        },
      });
    },
    onSuccess: (data) => {
      toast.success('Reply posted');
      setReplyDraft('');
      setIsReplyOpen(false);
      const merged =
        normalizeCommentPayload(data as unknown) ?? (data as Comment);
      if (!queryClient.getQueryData(commentsQueryKey)) {
        void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
        return;
      }
      mergeGuestBlogCommentsInfiniteCache(queryClient, commentsQueryKey, {
        type: 'upsert',
        comment: merged,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to post reply.');
    },
  });

  const { mutate: removeComment, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteComment({ commentId: id }),
    onSuccess: () => {
      toast.success('Comment deleted');
      setDeleteOpen(false);
      if (!queryClient.getQueryData(commentsQueryKey)) {
        void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
        return;
      }
      mergeGuestBlogCommentsInfiniteCache(queryClient, commentsQueryKey, {
        type: 'delete',
        commentId: id,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to delete comment.');
    },
  });

  const startEdit = () => {
    setIsReplyOpen(false);
    setReplyDraft('');
    setEditValue(content);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const cancelReply = () => {
    setReplyDraft('');
    setIsReplyOpen(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (!isSaving) {
        cancelEdit();
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSaving && canManage) {
        saveEdit();
      }
    }
  };

  const handleReplyKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isReplying && canReply) {
        submitReply();
      }
    }
  };

  const showActionRow = canReply || canManage;

  return (
    <div className='group flex gap-3'>
      <Avatar
        className={`mt-0.5 h-8 w-8 shrink-0 ring-2 ring-white`}
        aria-hidden
      >
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt='' className='object-cover' />
        ) : null}
        <AvatarFallback className={`text-xs font-semibold ${avatarColor}`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-start justify-between gap-x-2 gap-y-1'>
          <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5'>
            <span className='text-sm font-semibold text-neutral-900'>
              {fullName}
            </span>

            {isReply && replyFullName ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500'>
                <CornerDownRight className='h-2.5 w-2.5' aria-hidden />
                {replyFullName}
              </span>
            ) : null}

            <time
              dateTime={createdAt}
              className='text-xs text-neutral-400'
              title={new Date(createdAt).toLocaleString()}
            >
              {timeAgo}
            </time>
          </div>

          {showActionRow && !isEditing ? (
            <div className='flex shrink-0 flex-wrap items-center justify-end gap-1'>
              {canReply ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-xs text-neutral-600'
                  onClick={() => {
                    if (isReplyOpen) {
                      cancelReply();
                    } else {
                      setIsEditing(false);
                      setIsReplyOpen(true);
                    }
                  }}
                  aria-expanded={isReplyOpen}
                  aria-label={isReplyOpen ? 'Close reply' : 'Reply to comment'}
                >
                  <MessageSquareReply
                    className='mr-1 h-3.5 w-3.5'
                    aria-hidden
                  />
                  {isReplyOpen ? 'Close' : 'Reply'}
                </Button>
              ) : null}
              {canManage ? (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 text-xs text-neutral-600'
                    onClick={startEdit}
                    aria-label='Edit comment'
                  >
                    <Pencil className='mr-1 h-3.5 w-3.5' aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 text-xs text-rose-600 hover:text-rose-700'
                    onClick={() => setDeleteOpen(true)}
                    disabled={isDeleting}
                    aria-label='Delete comment'
                  >
                    {isDeleting ? (
                      <Spinner className='size-3.5' />
                    ) : (
                      <Trash2 className='mr-1 h-3.5 w-3.5' aria-hidden />
                    )}
                    Delete
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div className='mt-2 space-y-2'>
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              rows={5}
              maxLength={COMMENT_MAX_LENGTH}
              disabled={isSaving}
              className='field-sizing-fixed min-h-32 max-h-[min(50vh,28rem)] w-full resize-y overflow-y-auto text-sm'
              aria-label='Edit comment'
            />
            <div className='flex flex-wrap items-end justify-between gap-2 text-xs text-neutral-400'>
              <span
                className={
                  editCharNearLimit
                    ? 'tabular-nums text-amber-500'
                    : 'tabular-nums text-neutral-500'
                }
              >
                {editCharCount}/{COMMENT_MAX_LENGTH}
              </span>
              <div className='flex flex-wrap items-center justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => saveEdit()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className='flex items-center gap-1.5'>
                      <Spinner className='size-3.5' />
                      Saving…
                    </span>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className='mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-neutral-700'>
            {content}
          </p>
        )}

        {!isEditing && isReplyOpen && canReply ? (
          <div className='mt-3 rounded-lg border border-neutral-100 bg-neutral-50/80 p-3'>
            <Textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              placeholder='Write a reply… (Enter to submit, Shift+Enter for new line)'
              rows={3}
              maxLength={COMMENT_MAX_LENGTH}
              disabled={isReplying}
              className='field-sizing-fixed min-h-20 w-full resize-y overflow-y-auto border-neutral-200 bg-white text-sm'
              aria-label='Reply to comment'
            />
            <div className='mt-2 flex flex-wrap items-end justify-between gap-2'>
              <span
                className={
                  replyCharNearLimit
                    ? 'text-xs tabular-nums text-amber-500'
                    : 'text-xs tabular-nums text-neutral-500'
                }
              >
                {replyCharCount}/{COMMENT_MAX_LENGTH}
              </span>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={cancelReply}
                  disabled={isReplying}
                >
                  Cancel
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => submitReply()}
                  disabled={isReplying}
                >
                  {isReplying ? (
                    <span className='flex items-center gap-1.5'>
                      <Spinner className='size-3.5' />
                      Posting…
                    </span>
                  ) : (
                    'Post reply'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the comment from the thread. You cannot undo this
              action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type='button'
              className='bg-rose-600 hover:bg-rose-600/90'
              onClick={(e) => {
                e.preventDefault();
                removeComment();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className='flex items-center gap-1.5'>
                  <Spinner className='size-3.5' />
                  Deleting…
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentItem;
