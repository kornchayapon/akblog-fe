'use client';

import { useUser } from '@/modules/front/auth/hooks/use-user';
import Footer from '@/modules/front/common/components/footer';
import FrontNavbar from '@/modules/front/common/components/navbar/front-navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const FrontLayout = ({ children }: Readonly<LayoutProps>) => {
  const { user } = useUser();

  return (
    <div className='flex flex-col min-h-screen'>
      <FrontNavbar user={user} />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
};

export default FrontLayout;
