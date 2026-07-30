'use client'

import BlogListView from "../components/blog-list-view";

interface BlogsCategoryViewProps {
  slug: string;
}

const BlogsCategoryView = ({ slug }: BlogsCategoryViewProps) => {
  return (
    <BlogListView type="category" slug={slug} />
  )
}

export default BlogsCategoryView