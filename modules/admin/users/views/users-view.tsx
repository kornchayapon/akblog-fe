'use client';

import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { ADMIN_USER_KEY } from '@/lib/constants/query-key';
import { fetchUsers, restoreUser, softDeleteUser } from '@/lib/apis/users';

import TableSkeleton from '../../common/components/data-table/table-skeleton';
import ErrorCard from '../../common/components/error-card';

import { DataTable } from '../../common/components/data-table/data-table';
import { UserColumns } from '../data/user-columns';

import CreateUserDialog from '../components/create-user-dialog';
import UpdateUserDialog from '../components/update-user-dialog';
import ConfirmDeleteDialog from '../../common/components/confirm-delete-dialog';

import { toast } from 'sonner';

const PAGE_SIZE = 10;

const UsersView = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openConfirmSoftDeleteDialog, setOpenConfirmSoftDeleteDialog] =
    useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: [ADMIN_USER_KEY, pageIndex],
    queryFn: () =>
      fetchUsers({
        page: pageIndex,
        limit: PAGE_SIZE,
        withDeleted: true,
      }),
    staleTime: 5000,
    placeholderData: (previousData) => previousData,
  });

  // soft delete mutation
  const { mutate: softDeleteMutate, isPending: isSoftDeletePending } =
    useMutation({
      mutationFn: softDeleteUser,
      onSuccess: () => {
        toast.success('Soft delete user successful');
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
          'Delete user error (mutation)';

        toast.error(message);
      },
    });

  // restore user
  const { mutate: restoreMutate } = useMutation({
    mutationFn: restoreUser,
    onSuccess: () => {
      toast.success('Restore user successful');
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
        'Delete user error (mutation)';

      toast.error(message);
    },
  });

  const handleUpdateDialogOpenChange = (nextOpen: boolean) => {
    setOpenUpdateDialog(nextOpen);
    if (!nextOpen) {
      setUserId(null);
    }
  };

  // from user column
  const handleUpdate = (id: number) => {
    setUserId(id);
    setOpenUpdateDialog(true);
  };

  const handleSoftDelete = (id: number) => {
    setUserId(id);
    setOpenConfirmSoftDeleteDialog(true);
  };

  const handleRestore = (id: number) => {
    restoreMutate({ userId: id });
  };

  // from dialog
  const handleConfirmSoftDelete = () => {
    if (userId) {
      softDeleteMutate({ userId });
    }
  };

  let content: React.ReactNode;

  if (isPending && !data) {
    content = <TableSkeleton />;
  } else if (isError) {
    const title = 'Error is occur';
    const message = error?.message || 'Fetch users is problem';

    content = <ErrorCard title={title} message={message} />;
  } else if (data) {
    content = (
      <div>
        <CreateUserDialog
          open={openCreateDialog}
          onOpenChange={setOpenCreateDialog}
        />
        <UpdateUserDialog
          userId={userId}
          open={openUpdateDialog}
          onOpenChange={handleUpdateDialogOpenChange}
        />
        {/* Soft Delete */}
        <ConfirmDeleteDialog
          open={openConfirmSoftDeleteDialog}
          onConfirm={handleConfirmSoftDelete}
          onClose={() => setOpenConfirmSoftDeleteDialog(false)}
          isLoading={isSoftDeletePending}
          header='Confirm Deletion?'
          description='Move this user to trash? You can restore it later.'
        />
        <DataTable
          data={Array.isArray(data.results) ? data.results : []}
          columns={UserColumns(handleUpdate, handleSoftDelete, handleRestore)}
          createTitle='Create User'
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

export default UsersView;
