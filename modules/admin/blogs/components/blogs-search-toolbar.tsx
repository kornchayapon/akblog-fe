'use client';

import { Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface BlogsSearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching?: boolean;
}

const BlogsSearchToolbar = ({
  value,
  onChange,
  isSearching = false,
}: BlogsSearchToolbarProps) => {
  return (
    <div className="mb-4 px-4 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="admin-blogs-search" className="sr-only">
            Search blogs
          </label>
          <div className="flex max-w-xl items-center gap-2">
            <Input
              id="admin-blogs-search"
              type="search"
              name="blog-search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Search by title, content, or author name…"
              autoComplete="off"
              className="min-w-0 flex-1"
            />
            {isSearching ? (
              <span
                className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs"
                aria-live="polite"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden />
                <span className="hidden sm:inline">Updating…</span>
              </span>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">
            Matches title, content, and author name (same as the public site).
            Results update shortly after you pause typing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogsSearchToolbar;
