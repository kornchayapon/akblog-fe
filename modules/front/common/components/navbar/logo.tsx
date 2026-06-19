import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href='/' className='flex items-center gap-2'>
      <Image src='/images/ak-blog-logo.png' alt='Logo' width={40} height={40} />
      <span className='text-base uppercase tracking-tight font-bold'>AK Blog</span>
    </Link>
  );
};

export default Logo;
