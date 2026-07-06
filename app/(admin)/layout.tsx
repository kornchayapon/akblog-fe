'use client';

import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

import AppSidebar from '@/modules/admin/common/sidebar/app-sidebar';
import AdminNavbar from '@/modules/admin/common/admin-navbar';

import { useUser } from '@/modules/guest/auth/hooks/use-user';

interface LayoutProps {
  children: React.ReactNode;
}
const AdminLayout = ({ children }: Readonly<LayoutProps>) => {
  const { user } = useUser();

  return (
    <div className='h-svh min-h-0 w-full overflow-hidden bg-background text-foreground'>
      <SidebarProvider
        className='h-full'
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} variant='inset' />
        <SidebarInset>
          <AdminNavbar />
          <div className='flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto'>
            <div className='@container/main flex min-h-0 flex-1 flex-col gap-2'>
              <div className='flex min-w-0 flex-col gap-4 py-4 md:gap-6 md:py-6'>
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
