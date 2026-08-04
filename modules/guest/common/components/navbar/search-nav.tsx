'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

import BlogSearchCommand from '../search/blog-search-command';

const SearchNav = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant='outline'
        className={`
          relative h-9 w-full max-w-sm items-center justify-start rounded-xl border-0 bg-muted/90 text-sm
          text-muted-foreground shadow-none transition-colors sm:pr-12 md:w-40 lg:w-64
          hover:bg-muted hover:text-foreground
          focus-visible:ring-2 focus-visible:ring-ring
        `}
        onClick={() => setOpen(true)}
        type='button'
      >
        <Search className='mr-2 h-4 w-4' />
        <span className='hidden lg:inline-flex'>Search blogs...</span>
        <span className='inline-flex lg:hidden'>Search...</span>
        <kbd className='pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded-md border border-border/60 bg-card px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <BlogSearchCommand open={open} onOpenChange={setOpen} />
    </>
  );
};

export default SearchNav;
