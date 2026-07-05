'use client';

import { Suspense } from 'react';

import { useUser } from '@/modules/front/auth/hooks/use-user';
import Footer from '@/modules/front/common/components/footer';
import FrontNavbar from '@/modules/front/common/components/navbar/front-navbar';
import NavbarSkeleton from '@/modules/front/common/components/navbar/navbar-skeleton';
import Loading from '@/modules/front/common/components/loading';

interface LayoutProps {
  children: React.ReactNode;
}

const FrontLayout = ({ children }: Readonly<LayoutProps>) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Suspense fallback={<NavbarSkeleton />}>
        <FrontNavbar user={user} />
      </Suspense>

      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
};

export default FrontLayout;
