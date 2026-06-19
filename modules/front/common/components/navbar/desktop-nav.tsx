'use client';

import { usePathname } from 'next/navigation';

import { cn, isNavItemActive } from '@/lib/utils';

import { NavItem } from './navbar';
import Link from 'next/link';

interface DesktopNavProps {
  items: NavItem[];
}

const DesktopNav = ({ items }: DesktopNavProps) => {
  const pathname = usePathname();

  return (
    <nav
      className='flex items-center gap-6 shrink-0'
      role='navigation'
      aria-label='Man navigation'
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
          >
            <span className="relative z-10">{item.title}</span>
            {/* Description tooltip */}
            {item.description && (
              <span className='absolute top-full left-1/2 z-50 -translate-x-1/2 
                whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-xs 
                text-popover-foreground opacity-0 shadow-md invisible transition-all 
                duration-200 group-hover:visible group-hover:opacity-100'>
                {item.description}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default DesktopNav;
