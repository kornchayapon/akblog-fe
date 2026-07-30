'use client';

import BlogListView from '../components/blog-list-view';

interface BlogsTagViewProps {
  slug: string;
}

const BlogsTagView = ({ slug }: BlogsTagViewProps) => (
  <BlogListView type="tag" slug={slug} />
);

export default BlogsTagView;
