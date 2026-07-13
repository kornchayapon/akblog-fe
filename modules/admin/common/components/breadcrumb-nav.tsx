'use client'

import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';


export type BreadcrumbNavItem = {
  href: string;
  children: string;
  type: 'link' | 'page';
};

type BreadcrumbNavProps = {
  navItems: BreadcrumbNavItem[];
};

const BreadcrumbNav = ({ navItems }: BreadcrumbNavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {navItems.map((item, index) => (
          <div key={item.href} className='flex items-center'>
            <BreadcrumbItem>
              {item.type === 'page' ? (
                <BreadcrumbPage>{item.children}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.children}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {/* last item */}
            {index < navItems.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
