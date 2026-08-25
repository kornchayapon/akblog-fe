import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { User } from '@/lib/interfaces/user';

import Logo from '@/modules/guest/common/components/navbar/logo';

import NavMain from './nav-main';

import { navItems } from './data/nav-items';
import { NavUser } from './data/nav-user';
import { UserRole } from '@/lib/enums/user-role.enum';
import { STAFF_RESTRICTED_ADMIN_PATHS } from '@/lib/constants/staff-restricted-admin';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

const restrictedUrls = new Set<string>(STAFF_RESTRICTED_ADMIN_PATHS);

const AppSidebar = ({ user, ...props }: AppSidebarProps) => {
  const mainNavItems =
    user?.role === UserRole.STAFF
      ? navItems.filter((item) => !restrictedUrls.has(item.url))
      : navItems;

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              className='data-[slot=sidebar-menu-button]:h-auto! 
                data-[slot=sidebar-menu-button]:min-h-10 
                data-[slot=sidebar-menu-button]:py-2! 
                overflow-visible'
            >
              <Logo variant='sidebar' priority />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
