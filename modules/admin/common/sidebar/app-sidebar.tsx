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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

const AppSidebar = ({ user, ...props }: AppSidebarProps) => {
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
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />        
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
