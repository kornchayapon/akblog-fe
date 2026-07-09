import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { NavItem } from './data/nav-items';

interface NavItemsProps {
  items: NavItem[];
}

import { IconFileText, IconPlus } from '@tabler/icons-react';

const NavMain = ({ items }: NavItemsProps) => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            <SidebarMenuButton
              asChild              
              className='bg-primary text-primary-foreground hover:bg-primary/90
                  hover:text-primary-foreground action:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
            >
              <Link href='/admin/blogs/create' onClick={handleNavigate}>
                <IconFileText />
                <span>Create Blog</span>
              </Link>
            </SidebarMenuButton>
            <IconPlus className='size-4 text-muted-foreground group-data-[collapsible=icon]:hidden' />
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild                  
                  isActive={isActive}
                  className='data-[active=true]:bg-emerald-600
                    data-[active=true]:text-white
                    data-[active=true]:hover:bg-emerald-600
                  '
                >
                  <Link href={item.url} onClick={handleNavigate}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavMain;
