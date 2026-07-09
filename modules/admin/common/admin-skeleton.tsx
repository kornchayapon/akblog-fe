import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function AdminSkeleton() {
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
        <Sidebar collapsible='offcanvas' variant='inset'>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className='p-1.5'>
                  {/* Logo Skeleton */}
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-8 w-8 rounded-lg' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className='p-2'>
            {/* Nav Items Skeleton */}
            <div className='space-y-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center gap-2 px-2 py-1.5'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-full' />
                </div>
              ))}
            </div>
          </SidebarContent>
          <SidebarFooter>
            {/* User Profile Skeleton */}
            <div className='p-2'>
              <div className='flex items-center gap-2 rounded-lg bg-sidebar-accent/50 p-2'>
                <Skeleton className='h-8 w-8 rounded-lg' />
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-3.5 w-[80%]' />
                  <Skeleton className='h-3 w-[60%]' />
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* Header Skeleton */}
          <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 lg:gap-2 lg:px-6'>
            <SidebarTrigger className='-ml-1 opacity-50' />
            <Separator orientation='vertical' className='mx-2 h-4' />
            <Skeleton className='h-5 w-32' />
            <div className='ml-auto'>
              <Skeleton className='h-8 w-20' />
            </div>
          </header>

          {/* Content Skeleton */}
          <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-4 md:gap-6 md:p-6'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='rounded-xl border bg-card text-card-foreground shadow'
                >
                  <div className='p-6 space-y-2'>
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-8 w-1/4' />
                  </div>
                </div>
              ))}
            </div>
            <div className='min-h-0 flex-1 rounded-xl border bg-card text-card-foreground shadow'>
              <div className='p-6 space-y-6'>
                <Skeleton className='h-8 w-1/3' />
                <div className='space-y-4'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
