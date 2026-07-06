import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';


export type LogoProps = Readonly<{
  /** Prioritize loading (navbar) */
  priority?: boolean;
  /** Light text for dark footer / inverse surfaces */
  onDark?: boolean;
  className?: string;
  /**
   * Admin sidebar: show full mark (no circular crop), link to dashboard.
   * Navbar uses compact square treatment.
   */
  variant?: 'default' | 'sidebar';
}>;

const Logo = ({
  priority = false,
  onDark = false,
  className,
  variant = 'default',
}: LogoProps) => {
  const isSidebar = variant === 'sidebar';

  return (
    <Link
      href={isSidebar ? '/admin' : '/'}
      className={cn(
        'flex min-w-0 items-center gap-2',
        isSidebar && 'w-full',
        className,
      )}
      aria-label={isSidebar ? 'AK Blog — admin dashboard' : 'AK Blog — home'}
    >
      <Image
        src='/images/ak-blog-logo.png'
        alt='AK Blog'
        width={isSidebar ? 200 : 40}
        height={isSidebar ? 56 : 40}
        className={cn(
          'shrink-0',
          isSidebar
            ? 'h-9 w-auto max-w-[min(11rem,calc(100%-3.25rem))] object-contain object-left'
            : 'size-10 rounded-full object-cover',
        )}
        priority={priority}
      />
      <span
        className={cn(
          'mt-0.5 truncate text-base font-bold uppercase tracking-tight',
          onDark ? 'text-white' : 'text-foreground',
        )}
      >
        Blog
      </span>
    </Link>
  );
};

export default Logo;
