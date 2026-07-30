'use client';

import { useParams } from 'next/navigation';

import BlogsCategoryView from '@/modules/guest/blogs/views/blogs-category-view';

const BlogsCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  return <BlogsCategoryView slug={slug} />;
};

export default BlogsCategoryPage;
