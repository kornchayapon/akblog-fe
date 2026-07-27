'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { NavItem } from './guest-navbar';
import { NavCategoriesDropdown } from './nav-categories';
import { isNavItemActive } from './nav-link-utils';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/interfaces/category';

interface DesktopNavProps {
  items: NavItem[];
  categories: Category[];
  isCategoriesLoading: boolean;
}

const DesktopNav = ({
  items,
  categories,
  isCategoriesLoading,
}: DesktopNavProps) => {
  const pathname = usePathname();

  return (
    <nav 
      className="flex items-center gap-6 shrink-0" 
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group relative px-1 py-2 text-sm font-bold transition-all outline-none',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-primary',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="relative z-10">{item.title}</span>
            
            {/* Description tooltip */}
            {item.description && (
              <span className='absolute top-full left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-md invisible transition-all duration-200 group-hover:visible group-hover:opacity-100'>
                {item.description}
              </span>
            )}

            {/* Active indicator */}
            {isActive && (
              <motion.span
                className='absolute bottom-0 left-0 h-0.5 w-full bg-primary'
                layoutId="navbar-active-indicator"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}

            {/* Hover indicator */}
            <span className='absolute inset-0 rounded-lg bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100' />
          </Link>
        );
      })}

      <NavCategoriesDropdown
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
      />
    </nav>
  );
};

export default DesktopNav;