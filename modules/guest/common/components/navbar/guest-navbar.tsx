'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

import SignUpDialog from '@/modules/guest/auth/components/sign-up-dialog';
import { useAuthDialogStore } from '@/modules/guest/auth/stores/auth-dialog-store';
import SignInDialog from '@/modules/guest/auth/components/sign-in-dialog';

import { User } from '@/lib/interfaces/user';
import { Category } from '@/lib/interfaces/category';
import { fetchCategories } from '@/lib/apis/categories';

import Logo from './logo';
import SearchNav from './search-nav';
import DesktopNav from './desktop-nav';
import UserNav from './user-nav';

import { useMediaQuery } from '@/hooks/use-media-query';
import { Menu } from 'lucide-react';
import Sidebar from '../sidebar/sidebar';

interface NavbarProps {
  user: User | null;
}

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

interface CategoriesResponse {
  results?: Category[];
}

const GuestNavbar = ({ user }: NavbarProps) => {
  const { isSignUpOpen, setSignUpOpen, isSignInOpen, setSignInOpen } =
    useAuthDialogStore();
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const isMobile = useMediaQuery('(max-width: 1024px)');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setIsCategoriesLoading(true);

      try {
        const data = (await fetchCategories({
          page: 1,
          limit: 1000,
          withDeleted: false,
        })) as CategoriesResponse | undefined;

        if (isMounted) {
          setCategories(data?.results ?? []);
        }
      } catch (error: unknown) {
        console.error('[Navbar][fetchCategories] failed', error);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl transition-all ${
        isScrolled ? 'shadow-md shadow-primary/5' : 'shadow-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      role='banner'
    >
      <div className='container mx-auto h-16 px-4 flex items-center justify-between gap-4'>        
        {/* Left: Logo & Sidebar Trigger */}
        <div className='flex items-center gap-4 shrink-0'>
          <AnimatePresence>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant='ghost'
                  size='icon'
                  className='lg:hidden rounded-xl hover:bg-muted'
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label='Open menu'
                >
                  <Menu className='w-5 h-5' />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Logo priority />
        </div>

        {/* Center: Search & Navigation Link */}
        <div className='hidden lg:flex items-center grow max-w-3xl gap-8'>
          {/* <SearchNav /> */}
          <DesktopNav
            items={navItems}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
          />
        </div>

        {/* Right: User Actions */}
        <div className='flex items-center gap-2 shrink-0'>
          {user ? (
            <div className='flex items-center gap-1 sm:gap-2'>              
              <UserNav user={user} />
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                className='hidden sm:flex rounded-xl font-bold text-foreground transition-colors hover:bg-muted hover:text-primary'
                onClick={() => setSignInOpen(true)}
              >
                Sign in
              </Button>
              <Button
                className='rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]'
                onClick={() => setSignUpOpen(true)}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar
            items={navItems}
            open={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
          />
        )}
      </AnimatePresence>

      {/* Auth dialog */}
      <SignUpDialog open={isSignUpOpen} onOpenChange={setSignUpOpen} />
      <SignInDialog open={isSignInOpen} onOpenChange={setSignInOpen} />
    </motion.header>
  );
};

export default GuestNavbar;
