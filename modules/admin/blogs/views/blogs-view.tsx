'use client';

import { useCallback, useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQuery } from '@tanstack/react-query';

import { ADMIN_BLOGS_KEY } from '@/lib/constants/query-key';
import {
  deletePermanentBlog,
  fetchBlogs,
  restoreBlog,
  softDeleteBlog,
  updateBlogStatus,
} from '@/lib/apis/blogs';

import { useHeader } from '../../common/stores/header';
import TableSkeleton from '../../common/components/data-table/table-skeleton';
import ErrorCard from '../../common/components/error-card';
import { DataTable } from '../../common/components/data-table/data-table';
import ConfirmDeleteDialog from '../../common/components/confirm-delete-dialog';

import { BlogColumns } from '../data/blog-columns';

import { toast } from 'sonner';
import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';

import BlogsSearchToolbar from '../components/blogs-search-toolbar';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

const BlogsView = () => {
  const [openConfirmSoftDeleteDialog, setOpenConfirmSoftDeleteDialog] =
    useState<boolean>(false);
  const [
    openConfirmPermanentDeleteDialog,
    setOpenConfirmPermanentDeleteDialog,
  ] = useState<boolean>(false);

  const [blogId, setBlogId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>('');

  const router = useRouter();

  const effectiveSearch = useDebouncedValue(
    searchInput.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: [ADMIN_BLOGS_KEY, pageIndex, effectiveSearch],
    queryFn: () =>
      fetchBlogs({
        page: pageIndex,
        limit: PAGE_SIZE,
        withDeleted: true,
        status: PublishStatusEnum.PUBLISHED,
        ...(effectiveSearch.length > 0 ? { search: effectiveSearch } : {}),
      }),
    staleTime: 5000,
    placeholderData: (previousData) => previousData,
  });

  const { mutate: softDeleteMutate, isPending: isSoftDeletePending } =
    useMutation({
      mutationFn: softDeleteBlog,
      onSuccess: () => {
        toast.success('Soft delete blog successful');
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
          'Delete blog error (mutation)';

        toast.error(message);
      },
    });

  const setTitle = useHeader((state) => state.setTitle);

  const { mutate: restoreMutate } = useMutation({
    mutationFn: restoreBlog,
    onSuccess: () => {
      toast.success('Restore blog successful');
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
        'Delete blog error (mutation)';

      toast.error(message);
    },
  });

  const { mutate: deletePermanentMutate, isPending: isDeletePermanentPending } =
    useMutation({
      mutationFn: deletePermanentBlog,
      onSuccess: () => {
        toast.success('Delete blog successful');
        setOpenConfirmPermanentDeleteDialog(false);
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
          'Delete blog error (mutation)';

        toast.error(message);
      },
    });

  const { mutate: updateStatusMutate } = useMutation({
    mutationFn: ({
      blogId: id,
      status,
    }: {
      blogId: number;
      status: PublishStatusEnum;
    }) => updateBlogStatus({ blogId: id, status }),
    onSuccess: (_, { status }) => {
      toast.success(
        `Change status to ${status === PublishStatusEnum.DRAFT ? 'Draft' : status === PublishStatusEnum.PUBLISHED ? 'Published' : 'Archived'} successful`,
      );
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
        'Update blog status error (mutation)';

      toast.error(message);
    },
  });

  useEffect(() => {
    setTitle('Blogs management');
  }, [setTitle]);

  const handleCreate = useCallback(() => {
    router.push('/admin/blogs/create');
  }, [router]);

  const handleUpdate = useCallback(
    (id: number) => {
      router.push(`/admin/blogs/update/${id}`);
    },
    [router],
  );

  const handleConfirmSoftDelete = useCallback(() => {
    if (blogId) {
      softDeleteMutate({ blogId });
    }
  }, [blogId, softDeleteMutate]);

  const handleSoftDelete = useCallback((id: number) => {
    setBlogId(id);
    setOpenConfirmSoftDeleteDialog(true);
  }, []);

  const handleRestore = useCallback(
    (id: number) => {
      restoreMutate({ blogId: id });
    },
    [restoreMutate],
  );

  const handleConfirmPermanentDelete = useCallback(() => {
    if (blogId) {
      deletePermanentMutate({ blogId });
    }
  }, [blogId, deletePermanentMutate]);

  const handlePermanentDelete = useCallback((id: number) => {
    setBlogId(id);
    setOpenConfirmPermanentDeleteDialog(true);
  }, []);

  const handleStatusChange = useCallback(
    (id: number, nextStatus: PublishStatusEnum) => {
      updateStatusMutate({ blogId: id, status: nextStatus });
    },
    [updateStatusMutate],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPageIndex(1);
  }, []);

  let content: React.ReactNode;

  const isToolbarSearching = Boolean(data) && isFetching;

  if (isPending && !data) {
    content = <TableSkeleton />;
  } else if (isError) {
    const title = 'Error is occur';
    const message = error?.message || 'Fetch blogs is problem';

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
          description='Move this blog to trash? You can restore it later.'
        />

        <ConfirmDeleteDialog
          open={openConfirmPermanentDeleteDialog}
          onConfirm={handleConfirmPermanentDelete}
          onClose={() => setOpenConfirmPermanentDeleteDialog(false)}
          isLoading={isDeletePermanentPending}
          header='Confirm Permanent Deletion?'
          description={`This will be permanently deleted. You cannot restore it.!`}
        />

        <DataTable
          data={Array.isArray(data.results) ? data.results : []}
          columns={BlogColumns(
            handleUpdate,
            handleSoftDelete,
            handleRestore,
            handlePermanentDelete,
            handleStatusChange,
          )}
          createTitle='Create Blog'
          onCreate={handleCreate}
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
      <BlogsSearchToolbar
        value={searchInput}
        onChange={handleSearchChange}
        isSearching={isToolbarSearching}
      />
      <div className='font-bold'>{content}</div>
    </div>
  );
};

export default BlogsView;
