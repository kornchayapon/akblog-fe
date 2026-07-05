import Link from 'next/link';

import { Button } from '@/components/ui/button';
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
  ChevronRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  UserIcon,
} from 'lucide-react';

import { UserRole } from '@/lib/enums/user-role.enum';
import { User } from '@/lib/interfaces/user';
import { useAuth } from '@/modules/front/auth/hooks/use-auth';

interface UserNavProps {
  user: User | null;
}

interface AuthenticatedUserNavProps {
  user: User;
}

const GuestUserNav = () => {
  return <div>GuestUserName</div>;
};

const AuthenticatedUserNav = ({ user }: AuthenticatedUserNavProps) => {
  const { actions } = useAuth();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-10 w-10 p-0 flex items-center justify-center rounded-full 
            transition-all duration-300 ring-offset-background focus-visible:outline-none 
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-slate-100'
        >
          <div className='relative'>
            <div
              className='h-9 w-9 border border-dashed border-slate-300 transition-color 
              rounded-full flex items-center justify-center hover:border-slate-400'
            >
              <UserIcon className='h-5 w-5' />
            </div>
            <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500'></span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='w-72 p-2 rounded-2xl shadow-2xl transition-all'
        sideOffset={8}
      >
        <DropdownMenuLabel className='font-normal p-0'>
          <div className='flex items-center gap-3 p-3'>
            <div className='relative'>
              <div
                className='h-9 w-9 border border-dashed border-slate-300 transition-color 
              rounded-full flex items-center justify-center hover:border-slate-400'
              >
                <UserIcon className='h-5 w-5' />
              </div>
              <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500'></span>
            </div>
            <div className='flex flex-col space-y-0.5 overflow-hidden'>
              <p className='text-base font-bold text-slate-900 truncate'>{`${user.firstName ?? ''} ${
                user.lastName ?? ''
              }`}</p>
              <p className='text-xs text-slate-500 truncate'>
                {user.email ?? ''}
              </p>
              <p className='font-bold text-neutral-500 underline'>
                {user.role}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        {user.verified === false && (
          <>
            <DropdownMenuSeparator className='my-2' />
            <DropdownMenuItem
              asChild
              className='bg-red-50 hover:bg-red-100 text-red-600 focus:bg-red-100 focus:text-red-700 m-1 rounded-xl cursor-pointer p-3 transition-colors'
            >
              <Link href='/otp' className='flex flex-col gap-1 items-start'>
                <div className='flex items-center gap-2 font-bold'>
                  <Mail className='h-4 w-4 shrink-0' aria-hidden />
                  <span>Verify email</span>
                </div>
                <span className='text-[10px] opacity-80 leading-tight'>
                  Please verify your email for security purposes.
                </span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuGroup className='px-1 py-1'>
          {(user.role === UserRole.ADMIN || user.role === UserRole.STAFF) && (
            <>
              <DropdownMenuSeparator className='my-2' />
              <DropdownMenuItem
                asChild
                className='rounded-xl cursor-pointer p-3 focus:bg-slate-50 mb-1'
              >
                <Link
                  href='/admin'
                  className='flex items-center justify-between w-full'
                >
                  <div className='flex items-center gap-3 font-semibold text-slate-700'>
                    <div className='h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center'>
                      <LayoutDashboard className='h-4 w-4' />
                    </div>
                    <span>Admin Section</span>
                  </div>
                  <ChevronRight className='h-4 w-4 text-slate-300' />
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className='my-2 mx-2' />

        <DropdownMenuGroup className='px-1 py-1'>
          <DropdownMenuItem
            asChild
            className='rounded-xl cursor-pointer p-3 focus:bg-slate-50 mb-1'
          >
            <Link
              href='/notifications'
              className='flex w-full items-center justify-between gap-2'
            >
              <div className='flex min-w-0 items-center gap-3 font-semibold text-slate-700'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'>
                  <Inbox className='h-4 w-4' aria-hidden />
                </div>
                <span className='truncate'>Notifications</span>
              </div>
              <ChevronRight
                className='h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600'
                aria-hidden
              />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className='rounded-xl cursor-pointer p-3 focus:bg-slate-50 mb-1'
          >
            <Link
              href='/profile/edit'
              className='flex w-full items-center justify-between gap-2'
            >
              <div className='flex min-w-0 items-center gap-3 font-semibold text-slate-700'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800'>
                  <Settings className='h-4 w-4' aria-hidden />
                </div>
                <span className='truncate'>Update profile</span>
              </div>
              <ChevronRight
                className='h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600'
                aria-hidden
              />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className='my-2 mx-2' />

        <div className='p-1'>
          <DropdownMenuItem
            className='rounded-xl cursor-pointer p-3 font-bold group'
            onClick={() => actions.signOut()}
          >
            <div className='flex items-center gap-3 w-full'>
              <div className='h-8 w-8 rounded-lg flex items-center justify-center'>
                <LogOut className='h-4 w-4' />
              </div>
              <span>Sign out</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserNav = ({ user }: UserNavProps) => {
  if (!user) {
    return <GuestUserNav />;
  }

  return <AuthenticatedUserNav user={user} />;
};

export default UserNav;
