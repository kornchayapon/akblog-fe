'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// import SideSearchNav from './side-search-nav';
import Logo from '../navbar/logo';
import { SidebarCategoriesSection } from '../navbar/nav-categories';
import { isNavItemActive } from '../navbar/nav-link-utils';

import { NavItem } from '../navbar/guest-navbar';
import type { Category } from '@/lib/interfaces/category';
import { cn } from '@/lib/utils';

interface SidebarProps {
  items: NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  isCategoriesLoading: boolean;
}

function SidebarNavItems({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className='flex flex-col gap-1' aria-label='Primary'>
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
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
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

const Sidebar = ({
  items,
  open,
  onOpenChange,
  categories,
  isCategoriesLoading,
}: SidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        className={cn(
          'flex w-[min(100vw-1.5rem,20rem)] flex-col gap-0 border-r border-border/60 p-0',
          'bg-gradient-to-b from-background via-background to-muted/50',
        )}
      >
        <SheetHeader
          className='space-y-0 border-b border-border/60 px-5 pb-4 pt-5 text-left'
        >
          <SheetTitle className='sr-only'>Site menu</SheetTitle>
          <div className='flex flex-col gap-1'>
            <Logo />
            <SheetDescription className='text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
              Write from you to any one
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* <div className='px-5 pt-4'>
          <SideSearchNav onSubmitSearch={() => onOpenChange(false)} />
        </div> */}

        <ScrollArea className='min-h-0 flex-1'>
          <div className='flex flex-col gap-6 px-5 pb-8 pt-2'>
            <section aria-labelledby='sidebar-browse-label'>
              <h2
                id='sidebar-browse-label'
                className='mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'
              >
                Browse
              </h2>
              <SidebarNavItems items={items} />
            </section>

            <section aria-labelledby='sidebar-categories-label'>
              <h2
                id='sidebar-categories-label'
                className='mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'
              >
                Topics
              </h2>
              <SidebarCategoriesSection
                categories={categories}
                isCategoriesLoading={isCategoriesLoading}
                onNavigate={() => onOpenChange(false)}
              />
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
