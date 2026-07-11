'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ADMIN_USER_KEY } from '@/lib/constants/query-key';
import { fetchUsers } from '@/lib/apis/users';

import TableSkeleton from '../../common/components/data-table/table-skeleton';
import ErrorCard from '../../common/components/error-card';

import { DataTable } from '../../common/components/data-table/data-table';
import { UserColumns } from '../data/user-columns';

import CreateUserDialog from '../components/create-user-dialog';

const PAGE_SIZE = 10;

const UsersView = () => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);

  const { data, isPending, isError, error } = useQuery({
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
        <DataTable
          data={Array.isArray(data.results) ? data.results : []}
          columns={UserColumns()}
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
