'use client'

import { useParams } from 'next/navigation';

import BlogReadView from '@/modules/guest/blogs/views/blog-read-view';

const BlogReadPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return <BlogReadView slug={slug} />;
};

export default BlogReadPage;
