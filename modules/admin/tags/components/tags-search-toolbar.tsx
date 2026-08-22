'use client';

import { Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface TagsSearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching?: boolean;
}

const TagsSearchToolbar = ({
  value,
  onChange,
  isSearching = false,
}: TagsSearchToolbarProps) => {
  return (
    <div className="mb-4 px-4 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="admin-tags-search" className="sr-only">
            Search tags
          </label>
          <div className="flex max-w-xl items-center gap-2">
            <Input
              id="admin-tags-search"
              type="search"
              name="tag-search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Search by name or slug…"
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

export default TagsSearchToolbar;
