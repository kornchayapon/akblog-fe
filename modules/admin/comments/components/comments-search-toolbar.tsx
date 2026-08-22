'use client';

import { Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface CommentsSearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching?: boolean;
}

const CommentsSearchToolbar = ({
  value,
  onChange,
  isSearching = false,
}: CommentsSearchToolbarProps) => {
  return (
    <div className="mb-4 px-4 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="admin-comments-search" className="sr-only">
            Search comments
          </label>
          <div className="flex max-w-xl items-center gap-2">
            <Input
              id="admin-comments-search"
              type="search"
              name="comment-search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Search by comment text, author name, or blog slug…"
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
            Results update shortly after you pause typing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommentsSearchToolbar;
