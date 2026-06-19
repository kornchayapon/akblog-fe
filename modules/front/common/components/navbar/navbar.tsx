import Logo from './logo';
import SearchNav from './search-nav';
import DesktopNav from './desktop-nav';
import UserNav from './user-nav';
import { Button } from '@/components/ui/button';

const user = null;

export interface NavItem {
  href: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

// Main navigation items
const navItems: NavItem[] = [
  {
    href: '/',
    title: 'Home',
    description: 'Return to homepage',
  },
];

const FrontNavbar = () => {
  return (
    <div
      className='fixed top-0 left-0 right-0 z-50 
      border-b border-border/40 bg-background/85 
      backdrop-blur-xl'
    >
      <div
        className='container mx-auto h-16 px-4 flex items-center 
      justify-between gap-4  border border-red-500'
      >
        {/* Left: Logo & Sidebar Trigger */}
        <div className='flex items-center gap-4 shrink-0'>
          <Logo />
        </div>

        {/* Center: Search & Navigation Link */}
        <div className='flex grow max-w-3xl gap-8'>
          <SearchNav />
          <DesktopNav items={navItems} />
        </div>

        {/* Right: User Actions */}
        <div>
          {user ? (
            <div>
              <UserNav />
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                className='hidden sm:flex rounded-xl font-bold text-foreground 
                  transition-colors hover:bg-muted hover:text-primary'
              >
                Sign in
              </Button>
              <Button
                className='rounded-xl bg-primary px-6 font-bold text-primary-foreground 
                shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]'
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrontNavbar;
