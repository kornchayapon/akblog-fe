'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import BlogSearchView from '@/modules/guest/blogs/views/blog-search-view';

function BlogSearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  return <BlogSearchView query={q} />;
}

const BlogSearchPage = () => (
  <Suspense
    fallback={
      <div className="container mx-auto min-h-[40vh] px-4 pt-28 text-sm text-muted-foreground lg:px-6">
        Loading search…
      </div>
    }
  >
    <BlogSearchPageContent />
  </Suspense>
);

export default BlogSearchPage;
