'use client'

import { useParams } from 'next/navigation';

import UpdateBlogView from '@/modules/admin/blogs/views/update-blog-view';

const UpdateBlogPage = () => {
  const { blogId } = useParams<{ blogId: string }>();

  return <UpdateBlogView blogId={blogId} />
};

export default UpdateBlogPage;
