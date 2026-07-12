'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { deletePermanentTag, fetchTags } from '@/lib/apis/tags';
import { ADMIN_TAGS_KEY } from '@/lib/constants/query-key';

import ErrorCard from '@/modules/admin/common/components/error-card';

import { DataTable } from '@/modules/admin/common/components/data-table/data-table';
import TableSkeleton from '@/modules/admin/common/components/data-table/table-skeleton';
import { TagColumns } from '../data/tag-columns';

import CreateTagDialog from '../components/create-tag-dialog';
import UpdateTagDialog from '../components/update-tag-dialog';

import { toast } from 'sonner';
import ConfirmDeleteDialog from '../../common/components/confirm-delete-dialog';

import { useHeader } from '../../common/stores/header';

const PAGE_SIZE = 10;

const TagsView = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] =
    useState<boolean>(false);

  const [tagId, setTagId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(1);  

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [ADMIN_TAGS_KEY, pageIndex],
    queryFn: () =>
      fetchTags({
        page: pageIndex,
        limit: PAGE_SIZE,
        withDeleted: false,        
      }),
    staleTime: 5000,
    placeholderData: (previousData) => previousData,
  });

  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle('Tags management');
  }, [setTitle]);

  // permanent delete
  const { mutate: deletePermanentMutate, isPending: isDeletePermanentPending } =
    useMutation({
      mutationFn: deletePermanentTag,
      onSuccess: () => {
        toast.success('Delete tag successful');
        setOpenConfirmDeleteDialog(false);
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
          'Delete tag error (mutation)';

        toast.error(message);
      },
    });

  // from dialog
  const handleConfirmPermanentDelete = () => {
    if (tagId) {
      deletePermanentMutate({ tagId });
    }
  };

  // from tag column
  const handleUpdate = (id: number) => {
    setTagId(id);
    setOpenUpdateDialog(true);
  };

  const handleDeletePermanent = (id: number) => {
    setTagId(id);
    setOpenConfirmDeleteDialog(true);
  };

  let content: React.ReactNode;

  if (isPending && !data) {
    content = <TableSkeleton />;
  } else if (isError) {
    const title = 'Error is occur';
    const message = error?.message || 'Fetch tags is problem';

    content = <ErrorCard title={title} message={message} />;
  } else if (data) {
    content = (
      <div>
        <CreateTagDialog
          open={openCreateDialog}
          onOpenChange={setOpenCreateDialog}
        />
        <UpdateTagDialog
          tagId={tagId}
          open={openUpdateDialog}
          onOpenChange={setOpenUpdateDialog}
        />
        {/* Permanent delete */}
        <ConfirmDeleteDialog
          open={openConfirmDeleteDialog}
          onConfirm={handleConfirmPermanentDelete}
          onClose={() => setOpenConfirmDeleteDialog(false)}
          isLoading={isDeletePermanentPending}
          header='Confirm Permanent Deletion?'
          description={`This will be permanently deleted. You cannot restore it.!`}
        />
        <DataTable
          data={Array.isArray(data.results) ? data.results : []}
          columns={TagColumns(handleUpdate, handleDeletePermanent)}
          createTitle='Create Tag'
          onCreate={() => setOpenCreateDialog(true)}
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
    </div>
  );
};

export default TagsView;
