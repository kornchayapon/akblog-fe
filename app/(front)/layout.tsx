import Footer from '@/modules/front/common/components/footer';
import FrontNavbar from '@/modules/front/common/components/navbar/navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const FrontLayout = ({ children }: Readonly<LayoutProps>) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <FrontNavbar />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
};

export default FrontLayout;
