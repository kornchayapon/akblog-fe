'use client';

import BlogsTagView from '@/modules/guest/blogs/views/blogs-tag-view';
import { useParams } from 'next/navigation';

const BlogsTagPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return <BlogsTagView slug={slug} />;
};

export default BlogsTagPage;
