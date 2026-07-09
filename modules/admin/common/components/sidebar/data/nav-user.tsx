'use client';

import Link from 'next/link';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { User } from '@/lib/interfaces/user';
// import { getUserAvatarSrc } from '@/lib/utils/user-avatar-src';
import { useAuth } from '@/modules/guest/auth/hooks/use-auth';

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react';


export function SidebarUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className='flex items-center gap-2 rounded-lg px-2 py-2 animate-pulse'>
          {/* Avatar skeleton */}
          <div className='h-8 w-8 rounded-lg bg-muted' />

          {/* Name + Email */}
          <div className='grid flex-1 gap-1'>
            <div className='h-4 w-24 rounded bg-muted' />
            <div className='h-3 w-32 rounded bg-muted/70' />
          </div>

          {/* Dots icon placeholder */}
          <div className='ml-auto h-4 w-4 rounded bg-muted' />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface NavUserProps {
  user: User | null;
}

export const NavUser = ({ user }: NavUserProps) => {
  const { isMobile } = useSidebar();
  const { actions } = useAuth();

  const fullName = user
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : '';
  const fallbackText = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'U';

  if (!user) return <SidebarUserSkeleton />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user.avatar?.path} alt={fullName} />
                <AvatarFallback className='rounded-lg'>
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{`${user.firstName} ${
                  user.lastName ? user.lastName : ''
                }`}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatar?.path} alt={fullName} />
                  <AvatarFallback className='rounded-lg'>
                    {fallbackText}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{`${user.firstName} ${
                    user.lastName ? user.lastName : ''
                  }`}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href='/profile/edit'>
                  <IconUserCircle />
                  Update profile
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.signOut()}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
