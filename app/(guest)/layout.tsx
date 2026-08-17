'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useUser } from '@/modules/guest/auth/hooks/use-user';
import Footer from '@/modules/guest/common/components/footer';
import GuestNavbar from '@/modules/guest/common/components/navbar/guest-navbar';
import NavbarSkeleton from '@/modules/guest/common/components/navbar/navbar-skeleton';
import Loading from '@/modules/guest/common/components/loading';

interface LayoutProps {
  children: React.ReactNode;
}

const FrontLayout = ({ children }: Readonly<LayoutProps>) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.verified) {
      router.push('/otp');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Suspense fallback={<NavbarSkeleton />}>
        <GuestNavbar user={user} />
      </Suspense>

      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
};

export default FrontLayout;
