'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/interfaces/category';
import { ChevronDown, FolderOpen } from 'lucide-react';

interface NavCategoriesDropdownProps {
  categories: Category[];
  isCategoriesLoading: boolean;
}

const LoadingCategories = () => (
  <div className="grid gap-3 p-4 w-100">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyCategories = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <FolderOpen className='mb-3 h-12 w-12 text-muted-foreground/40' />
    <p className='text-sm font-medium text-foreground'>
      No categories found
    </p>
    <p className='mt-1 text-xs text-muted-foreground'>
      Check back later for new categories
    </p>
  </div>
);

interface SidebarCategoriesSectionProps {
  categories: Category[];
  isCategoriesLoading: boolean;
  onNavigate?: () => void;
}

export const SidebarCategoriesSection = ({
  categories,
  isCategoriesLoading,
  onNavigate,
}: SidebarCategoriesSectionProps) => {
  const pathname = usePathname();

  if (isCategoriesLoading) {
    return <LoadingCategories />;
  }

  if (categories.length === 0) {
    return <EmptyCategories />;
  }

  return (
    <nav className="flex flex-col gap-1">
      {categories.map((category) => {
        const isActive = pathname === `/blogs/category/${category.slug}`;

        return (
          <Link
            key={category.id}
            href={`/blogs/category/${category.slug}`}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200',
                isActive
                  ? 'scale-100 bg-primary'
                  : 'scale-0 bg-transparent group-hover:scale-100 group-hover:bg-muted-foreground/30',
              )}
              aria-hidden
            />
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
};

export const NavCategoriesDropdown = ({
  categories,
  isCategoriesLoading,
}: NavCategoriesDropdownProps) => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group flex h-9 items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold outline-none transition-colors',
          'hover:bg-muted hover:text-primary data-[state=open]:bg-muted data-[state=open]:text-primary',
          'focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        Categories
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-72 p-2"
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {isCategoriesLoading ? (
            <LoadingCategories />
          ) : categories.length === 0 ? (
            <EmptyCategories />
          ) : (
            <ul className="grid gap-1">
              {categories.map((category) => {
                const isActive = pathname === `/blogs/category/${category.slug}`;

                return (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link
                      href={`/blogs/category/${category.slug}`}
                      className={cn(
                        'flex items-center gap-3 rounded-lg p-3 text-sm no-underline outline-none transition-colors cursor-pointer',
                        isActive
                          ? 'bg-muted text-foreground'
                          : 'hover:bg-muted/70 hover:text-foreground',
                      )}
                    >
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                        <FolderOpen className='h-4 w-4 text-primary' />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className='mt-1 line-clamp-1 text-xs text-muted-foreground'>
                            {category.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </ul>
          )}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};