'use client';

import { type ReactElement, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare } from 'lucide-react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/modules/guest/auth/hooks/use-user';
import { useAuthDialogStore } from '@/modules/guest/auth/stores/auth-dialog-store';
import { useInfiniteScroll } from '../../hooks/use-infinite-scroll';

import { UserRole } from '@/lib/enums/user-role.enum';
import { createComment, fetchCommentsByBlog } from '@/lib/apis/comments';
import { COMMENT_MAX_LENGTH } from '@/lib/constants/comment';
import {
  GUEST_BLOG_COMMENTS_ORDER,
  GUEST_BLOG_COMMENTS_PAGE_SIZE,
  GUEST_BLOG_COMMENTS_SORT_BY,
  getGuestBlogCommentsQueryKey,
} from '@/lib/constants/guest-blog-comments-query';
import { canWriteBlogComments } from '@/lib/functions/can-write-blog-comments';
import {
  mergeGuestBlogCommentsInfiniteCache,
  normalizeCommentPayload,
} from '@/lib/functions/merge-guest-blog-comments-cache';
import { queryClient } from '@/lib/react-query/query-client';
import type { Comment as CommentModel } from '@/lib/interfaces/comment';
import type { GuestCommentsResponse } from '@/lib/interfaces/guest-comments';

import CommentItem from './comment-item';

const commentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(
      COMMENT_MAX_LENGTH,
      `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer`,
    ),
});

type CommentFormValues = z.infer<typeof commentSchema>;

type CommentProps = Readonly<{
  blogId: number;
}>;

type GroupedComment = {
  base: CommentModel;
  replies: CommentModel[];
};

function getCommentThreadRootId(
  comment: CommentModel,
  byId: Map<number, CommentModel>,
): number {
  if (!comment.isReply || !comment.parentId?.id) {
    return comment.id;
  }
  const parent = byId.get(comment.parentId.id);
  if (!parent) {
    return comment.id;
  }
  return getCommentThreadRootId(parent, byId);
}

const Comment = ({ blogId }: CommentProps): ReactElement => {
  const { user, isAuthenticated } = useUser();
  const setSignInOpen = useAuthDialogStore((state) => state.setSignInOpen);
  const loadMoreRef = useRef<HTMLDivElement>(null!);

  const hasEligibleRole =
    !!user?.role &&
    [UserRole.MEMBER, UserRole.STAFF, UserRole.ADMIN].includes(user.role);

  const canWriteComments = isAuthenticated && canWriteBlogComments(user);

  const placeholder = !isAuthenticated
    ? 'Sign in to leave a comment'
    : !user?.verified
      ? 'Verify your email to leave a comment'
      : !hasEligibleRole
        ? 'Your account cannot post comments'
        : 'Add your comment… (Enter to submit, Shift+Enter for new line)';

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  const commentsQueryKey = useMemo(
    () => getGuestBlogCommentsQueryKey(blogId),
    [blogId],
  );

  // useBlogCommentsSocket(blogId, commentsQueryKey, !!blogId);

  const {
    data: commentsData,
    isPending: isCommentsPending,
    isError: isCommentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GuestCommentsResponse, Error>({
    queryKey: commentsQueryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchCommentsByBlog({
        blogId,
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit: GUEST_BLOG_COMMENTS_PAGE_SIZE,
        sortBy: GUEST_BLOG_COMMENTS_SORT_BY,
        orderBy: GUEST_BLOG_COMMENTS_ORDER,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;

      const { currentPage, totalPages } = lastPage.meta as {
        currentPage?: number;
        totalPages?: number;
      };

      if (
        typeof currentPage !== 'number' ||
        typeof totalPages !== 'number' ||
        totalPages <= 0
      ) {
        return undefined;
      }

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!blogId,
    staleTime: 30_000,
  });

  useInfiniteScroll(loadMoreRef, () => fetchNextPage(), !!hasNextPage);

  const { mutate, isPending } = useMutation({
    mutationFn: (content: string) =>
      createComment({ payload: { content, blog: blogId } }),
    onSuccess: (data) => {
      form.reset();
      toast.success('Comment posted!');
      const merged =
        normalizeCommentPayload(data as unknown) ?? (data as CommentModel);
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
      toast.error(error.message ?? 'Failed to post comment.');
    },
  });

  const onSubmit = (values: CommentFormValues) => {
    if (!canWriteComments) {
      toast.error(
        user && !user.verified
          ? 'Verify your email before posting comments.'
          : 'You cannot post comments.',
      );
      return;
    }
    mutate(values.comment);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const commentValue = useWatch({ control: form.control, name: 'comment' });
  const charCount = commentValue.length;
  const charNearLimit = charCount > COMMENT_MAX_LENGTH * 0.9;

  const allComments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.results) ?? [],
    [commentsData?.pages],
  );
  const totalItems = commentsData?.pages[0]?.meta?.totalItems;
  const commentCount =
    typeof totalItems === 'number' ? totalItems : allComments.length;

  const { groupedComments, commentsById } = useMemo(() => {
    if (allComments.length === 0) {
      return {
        groupedComments: [] as GroupedComment[],
        commentsById: new Map<number, CommentModel>(),
      };
    }

    const byId = new Map(allComments.map((c) => [c.id, c] as const));

    const rootComments = allComments
      .filter((c) => !c.isReply)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    const repliesByRootId = new Map<number, CommentModel[]>();
    for (const c of allComments) {
      if (!c.isReply) continue;
      const rootId = getCommentThreadRootId(c, byId);
      if (rootId === c.id) continue;
      const bucket = repliesByRootId.get(rootId);
      if (bucket) bucket.push(c);
      else repliesByRootId.set(rootId, [c]);
    }

    for (const list of repliesByRootId.values()) {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    const groupedComments: GroupedComment[] = rootComments.map((base) => ({
      base,
      replies: repliesByRootId.get(base.id) ?? [],
    }));

    return { groupedComments, commentsById: byId };
  }, [allComments]);  

  const canManageComment = (c: CommentModel): boolean => {
    console.log('CommentModel', c);

    return canWriteComments && !!user && user.id === c.user.id;
  };

  return (
    <section className='mt-10'>
      <div className='mb-5 flex items-center gap-2'>
        <MessageSquare className='h-5 w-5 text-neutral-500' aria-hidden />
        <h2 className='text-base font-semibold text-neutral-900'>
          Comments
          {!isCommentsPending && commentCount > 0 ? (
            <span className='ml-2 inline-flex items-center justify-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600'>
              {commentCount}
            </span>
          ) : null}
        </h2>
      </div>

      {/* Comment form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name='comment'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={placeholder}
                    disabled={!canWriteComments || isPending}
                    onKeyDown={handleKeyDown}
                    onClick={() => {
                      if (!isAuthenticated) {
                        setSignInOpen(true);
                        return;
                      }
                      if (user && !user.verified) {
                        toast.info(
                          'Verify your email to leave comments and replies.',
                        );
                      }
                    }}
                    rows={3}
                    maxLength={COMMENT_MAX_LENGTH}
                    className='resize-none'
                    aria-label='Comment input'
                  />
                </FormControl>

                {canWriteComments && (
                  <div className='mt-1.5 flex items-center justify-between gap-2 text-xs text-neutral-400'>
                    {isPending ? (
                      <span className='flex items-center gap-1.5 text-emerald-700'>
                        <Spinner className='size-3' />
                        Posting your comment…
                      </span>
                    ) : (
                      <span>
                        <kbd className='rounded border border-neutral-200 bg-neutral-100 px-1 py-0.5 font-mono text-[10px] text-neutral-500'>
                          Enter
                        </kbd>{' '}
                        to submit &nbsp;·&nbsp;{' '}
                        <kbd className='rounded border border-neutral-200 bg-neutral-100 px-1 py-0.5 font-mono text-[10px] text-neutral-500'>
                          Shift+Enter
                        </kbd>{' '}
                        for new line
                      </span>
                    )}
                    <span
                      className={
                        charNearLimit
                          ? 'tabular-nums text-amber-500'
                          : 'tabular-nums text-neutral-400'
                      }
                    >
                      {charCount}/{COMMENT_MAX_LENGTH}
                    </span>
                  </div>
                )}

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {!isAuthenticated ? (
        <p className='mt-2 text-xs text-neutral-500'>
          <button
            type='button'
            onClick={() => setSignInOpen(true)}
            className='font-medium text-emerald-700 underline-offset-2 hover:underline'
          >
            Sign in
          </button>{' '}
          to join the conversation.
        </p>
      ) : user && !user.verified ? (
        <p className='mt-2 text-xs text-amber-800'>
          Verify your email to post comments and replies. Check your inbox for a
          verification link.
        </p>
      ) : isAuthenticated && user?.verified && !hasEligibleRole ? (
        <p className='mt-2 text-xs text-neutral-500'>
          Your account role cannot post comments on this blog.
        </p>
      ) : null}

      {/* Comment list */}
      <div className='mt-8'>
        <Separator className='mb-6 bg-neutral-100' />

        {isCommentsPending && allComments.length === 0 ? (
          <div className='space-y-5'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex gap-3'>
                <Skeleton className='h-8 w-8 shrink-0 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-3.5 w-32 rounded-full' />
                  <Skeleton className='h-3 w-full rounded-full' />
                  <Skeleton className='h-3 w-3/4 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        ) : isCommentsError ? (
          <p className='text-sm text-neutral-500'>
            Could not load comments. Please try again later.
          </p>
        ) : commentCount === 0 ? (
          <div className='flex flex-col items-center gap-2 py-8 text-center'>
            <MessageSquare className='h-8 w-8 text-neutral-200' aria-hidden />
            <p className='text-sm font-medium text-neutral-500'>
              No comments yet
            </p>
            <p className='text-xs text-neutral-400'>
              Be the first to share your thoughts.
            </p>
          </div>
        ) : (
          <ul className='space-y-5' aria-label='Comments'>
            {groupedComments.map(({ base, replies }) => (
              <li key={base.id} className='space-y-3'>
                <CommentItem
                  comment={base}
                  blogId={blogId}
                  canManage={canManageComment(base)}
                  canReply={canWriteComments}
                />

                {replies.length > 0 ? (
                  <ul
                    className='ml-4 space-y-3 border-l border-neutral-100 pl-4'
                    aria-label='Replies'
                  >
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem
                          comment={reply}
                          replyToUser={
                            reply.parentId?.id
                              ? (commentsById.get(reply.parentId.id)?.user ??
                                base.user)
                              : base.user
                          }
                          blogId={blogId}
                          canManage={canManageComment(reply)}
                          canReply={canWriteComments}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {commentCount > 0 ? (
        <div
          ref={loadMoreRef}
          className='h-12 mt-8 flex items-center justify-center text-sm text-muted-foreground'
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : !hasNextPage
              ? 'You have reached the end'
              : ''}
        </div>
      ) : null}
    </section>
  );
};

export default Comment;
