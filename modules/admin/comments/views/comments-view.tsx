'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  fetchAdminComments,
  restoreAdminComment,
  softDeleteAdminComment,
} from '@/lib/apis/admin-comments';
import { ADMIN_COMMENTS_KEY } from '@/lib/constants/query-key';

import { useHeader } from '../../common/stores/header';
import { DataTable } from '../../common/components/data-table/data-table';
import TableSkeleton from '../../common/components/data-table/table-skeleton';
import ErrorCard from '../../common/components/error-card';
import ConfirmDeleteDialog from '../../common/components/confirm-delete-dialog';

import { CommentColumns, type ViewBlogInfo } from '../data/comment-columns';

const PAGE_SIZE = 10;

const CommentsView = () => {
  const [openConfirmSoftDeleteDialog, setOpenConfirmSoftDeleteDialog] =
    useState<boolean>(false);
  const [commentId, setCommentId] = useState<number | null>(null);

  const [pageIndex, setPageIndex] = useState<number>(1);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [ADMIN_COMMENTS_KEY, pageIndex],
    queryFn: () =>
      fetchAdminComments({
        page: pageIndex,
        limit: PAGE_SIZE,
        withDeleted: true,
      }),
    staleTime: 5000,
    placeholderData: (previousData) => previousData,
  });

  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle('Comments management');
  }, [setTitle]);

  const { mutate: softDeleteMutate, isPending: isSoftDeletePending } =
    useMutation({
      mutationFn: softDeleteAdminComment,
      onSuccess: () => {
        toast.success('Soft delete comment successful');
        setOpenConfirmSoftDeleteDialog(false);
        refetch();
      },
      onError: (error: unknown) => {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const message =
          err.response?.data?.message ||
          err.message ||
          'Delete comment error (mutation)';

        toast.error(message);
      },
    });

  const { mutate: restoreMutate, isPending: isRestorePending } = useMutation({
    mutationFn: restoreAdminComment,
    onSuccess: () => {
      toast.success('Restore comment successful');
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message ||
        err.message ||
        'Restore comment error (mutation)';

      toast.error(message);
    },
  });

  const handleConfirmSoftDelete = () => {
    if (commentId) {
      softDeleteMutate({ commentId });
    }
  };

  const handleSoftDelete = (id: number) => {
    setCommentId(id);
    setOpenConfirmSoftDeleteDialog(true);
  };

  const handleRestore = (id: number) => {
    restoreMutate({ commentId: id });
  };

  const handleViewBlog = ({ blogSlug }: ViewBlogInfo) => {
    if (!blogSlug) {
      toast.error('Blog information not available');
      return;
    }

    window.open(`/blogs/${blogSlug}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (isError) {
      const message = error?.message || 'Fetch comments is problem';
      toast.error(message);
    }
  }, [isError, error]);

  let content: React.ReactNode;

  if (isPending && !data) {
    content = <TableSkeleton />;
  } else if (isError) {
    const title = 'Error is occur';
    const message = error?.message || 'Fetch comments is problem';
    content = <ErrorCard title={title} message={message} />;
  } else if (data) {
    content = (
      <div>
        <ConfirmDeleteDialog
          open={openConfirmSoftDeleteDialog}
          onConfirm={handleConfirmSoftDelete}
          onClose={() => setOpenConfirmSoftDeleteDialog(false)}
          isLoading={isSoftDeletePending}
          header='Confirm Deletion?'
          description='Move this comment to trash? You can restore it later.'
        />

        <DataTable
          data={Array.isArray(data.results) ? data.results : []}
          columns={CommentColumns(
            handleSoftDelete,
            handleRestore,
            handleViewBlog,
          )}
          // pagination params
          pageCount={data.meta.totalPages}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          totalCount={data.meta.totalItems}
        />
      </div>
    );
  }

  return (
    <div className='min-w-0 max-w-full px-6 pb-3'>
      <div className='font-bold'>{content}</div>
      {(isRestorePending || isSoftDeletePending) && (
        <span className='sr-only'>Updating comment…</span>
      )}
    </div>
  );
};

export default CommentsView;
