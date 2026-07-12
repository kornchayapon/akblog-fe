'use client';

import { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { useHeader } from '../../common/stores/header';
import { DataTable } from '../../common/components/data-table/data-table';
import TableSkeleton from '../../common/components/data-table/table-skeleton';
import ErrorCard from '../../common/components/error-card';

import { CategoryColumns } from '../data/category-columns';

import { ADMIN_CATEGORIES_KEY } from '@/lib/constants/query-key';
import { deletePermanentCategory, fetchCategories } from '@/lib/apis/categories';

import CreateCategoryDialog from '../components/create-category-dialog';
import UpdateCategoryDialog from '../components/update-category-dialog';
import ConfirmDeleteDialog from '../../common/components/confirm-delete-dialog';

import { toast } from 'sonner';

const PAGE_SIZE = 10;

const CategoriesView = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] =
    useState<boolean>(false);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(1);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [ADMIN_CATEGORIES_KEY, pageIndex],
    queryFn: () =>
      fetchCategories({
        page: pageIndex,
        limit: PAGE_SIZE,
        withDeleted: true,
      }),
    staleTime: 5000,
    placeholderData: (previousData) => previousData,
  });

  // permanent delete
  const { mutate: deletePermanentMutate, isPending: isDeletePermanentPending } =
    useMutation({
      mutationFn: deletePermanentCategory,
      onSuccess: () => {
        toast.success('Delete category successful');
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
          'Delete category error (mutation)';

        toast.error(message);
      },
    });

  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle('Categories management');
  }, [setTitle]);

  // by category column
  const handleUpdate = (id: number) => {
    setCategoryId(id);
    setOpenUpdateDialog(true);
  };

  const handleDeletePermanent = (id: number) => {
    setCategoryId(id);
    setOpenConfirmDeleteDialog(true);
  };

  // from dialog
  const handleConfirmPermanentDelete = () => {
    if (categoryId) {
      deletePermanentMutate({ categoryId });
    }
  };

  let content: React.ReactNode;

  if (isPending && !data) {
    content = <TableSkeleton />;
  } else if (isError) {
    const title = 'Error is occur';
    const message = error?.message || 'Fetch categories is problem';

    content = <ErrorCard title={title} message={message} />;
  } else if (data) {
    content = (
      <div>
        <CreateCategoryDialog
          open={openCreateDialog}
          onOpenChange={setOpenCreateDialog}
        />

        <UpdateCategoryDialog
          categoryId={categoryId}
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
          columns={CategoryColumns(handleUpdate, handleDeletePermanent)}
          createTitle='Create Category'
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

export default CategoriesView;
