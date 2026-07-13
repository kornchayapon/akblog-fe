'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { ADMIN_BLOGS_KEY } from '@/lib/constants/query-key';
import { fetchBlogs } from '@/lib/apis/blogs';

import { useHeader } from '../../common/stores/header';
import TableSkeleton from '../../common/components/data-table/table-skeleton';
import ErrorCard from '../../common/components/error-card';
import { DataTable } from '../../common/components/data-table/data-table';

import { BlogColumns } from '../data/blog-columns';

const PAGE_SIZE = 10;

const BlogsView = () => {
  const [openConfirmSoftDeleteDialog, setOpenConfirmSoftDeleteDialog] =
    useState<boolean>(false);
  const [
    openConfirmPermanentDeleteDialog,
    setOpenConfirmPermanentDeleteDialog,
  ] = useState<boolean>(false);

  const [blogId, setBlogId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(1);

  const router = useRouter();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [ADMIN_BLOGS_KEY, pageIndex],
    queryFn: () =>
      fetchBlogs({
        page: pageIndex,
        limit: PAGE_SIZE,
        withDeleted: true,
      }),
    staleTime: 5000,
    placeholderData: (previousData) => previousData,
  });

  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle('Blogs management');
  }, [setTitle]);

  /* const columns = useMemo(
    () =>
      BlogColumns(
        handleUpdate,
        handleSoftDelete,
        handleRestore,
        handlePermanentDelete,
        handleStatusChange,
      ),
    [
      handleUpdate,
      handleSoftDelete,
      handleRestore,
      handlePermanentDelete,
      handleStatusChange,
    ],
  ); */

  const handleCreate = useCallback(() => {
    router.push('/admin/blogs/create');
  }, [router]);

  const handleUpdate = useCallback(
    (id: number) => {
      router.push(`/admin/blogs/update/${id}`);
    },
    [router],
  );

  let content: React.ReactNode;

  if (isPending && !data) {
    content = <TableSkeleton />;
  } else if (isError) {
    const title = 'Error is occur';
    const message = error?.message || 'Fetch blogs is problem';

    content = <ErrorCard title={title} message={message} />;
  } else if (data) {
    content = (
      <div>
        <DataTable
          data={Array.isArray(data.results) ? data.results : []}
          columns={BlogColumns(handleUpdate)}
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
      <div className='font-bold'>{content}</div>
    </div>
  );
};

export default BlogsView;
