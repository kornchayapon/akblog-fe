'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Loader2, Search } from 'lucide-react';

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { GUEST_BLOG_SEARCH_KEY } from '@/lib/constants/query-key';
import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';
import type { GuestBlogsResponse } from '@/lib/interfaces/guest-blogs';
import { fetchGuestBlogsSearch } from '@/lib/apis/guest';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

const PREVIEW_LIMIT = 8;
const DEBOUNCE_MS = 300;

interface BlogSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlogSearchCommand = ({ open, onOpenChange }: BlogSearchCommandProps) => {
  const router = useRouter();
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input, DEBOUNCE_MS);
  const trimmedInput = input.trim();
  const trimmedDebounced = debounced.trim();
  const hasInput = trimmedInput.length > 0;
  const hasDebouncedQuery = trimmedDebounced.length > 0;
  const isDebouncing = hasInput && trimmedInput !== trimmedDebounced;

  const handleOpenChange = (next: boolean): void => {
    if (!next) {
      setInput('');
    }
    onOpenChange(next);
  };

  const { data, isFetching, isError } = useQuery<GuestBlogsResponse, Error>({
    queryKey: [GUEST_BLOG_SEARCH_KEY, 'preview', trimmedDebounced],
    queryFn: () =>
      fetchGuestBlogsSearch({
        search: trimmedDebounced,
        page: 1,
        limit: PREVIEW_LIMIT,
        status: PublishStatusEnum.PUBLISHED,
        sortBy: 'updatedAt',
        orderBy: 'DESC',
      }),
    enabled: open && hasDebouncedQuery,
    staleTime: 30_000,
  });

  const previewResults = data?.results ?? [];

  const goFullSearch = (): void => {
    const q = trimmedInput;
    if (!q) return;
    handleOpenChange(false);
    router.push(`/blogs/search?q=${encodeURIComponent(q)}`);
  };

  const showEmptyNoMatches =
    hasDebouncedQuery &&
    !isFetching &&
    !isDebouncing &&
    !isError &&
    previewResults.length === 0;

  const showHintRow = hasInput;

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Search blogs"
      description="Find blogs by title, content, or author"
      className="max-w-lg"
      commandProps={{ shouldFilter: false }}
    >
      <CommandInput
        placeholder="Search blogs…"
        value={input}
        onValueChange={setInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            goFullSearch();
          }
        }}
      />
        <CommandList className="max-h-[min(60vh,320px)]">
          {!hasInput && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              <Search
                className="mx-auto mb-3 size-10 opacity-40"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="font-medium text-foreground">Search published blogs</p>
              <p className="mt-1 text-xs">
                Type a keyword, then press Enter to open all matching results.
              </p>
            </div>
          )}

          {(isDebouncing || (hasDebouncedQuery && isFetching)) && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Searching…
            </div>
          )}

          {hasDebouncedQuery && isError && !isFetching && !isDebouncing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              <p className="font-medium text-destructive">Something went wrong</p>
              <p className="mt-1 text-xs">Try again in a moment.</p>
            </motion.div>
          )}

          {showEmptyNoMatches && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              <p className="font-medium text-foreground">No matching blogs</p>
              <p className="mt-1 text-xs">
                Press Enter to open the full search page anyway.
              </p>
            </motion.div>
          )}

          {hasDebouncedQuery &&
            !isFetching &&
            !isDebouncing &&
            previewResults.length > 0 && (
            <CommandGroup heading="Blogs">
              {previewResults.map((blog) => (
                <CommandItem
                  key={blog.id}
                  value={`${blog.slug}-${blog.id}`}
                  onSelect={() => {
                    handleOpenChange(false);
                    router.push(`/blogs/${blog.slug}`);
                  }}
                  className="cursor-pointer"
                >
                  <FileText className='text-primary' aria-hidden />
                  <span className="line-clamp-2">{blog.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {showHintRow && (
            <CommandGroup heading="Actions">
              <CommandItem
                value="__see-all__"
                onSelect={() => goFullSearch()}
                className='cursor-pointer font-medium text-primary'
              >
                <Search className="size-4" aria-hidden />
                See all results for &ldquo;{trimmedInput}&rdquo;
                <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline-block">
                  Enter
                </kbd>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
    </CommandDialog>
  );
};

export default BlogSearchCommand;
