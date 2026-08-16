import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AuthCalloutProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: ReactNode;
  className?: string;
}

export function AuthCallout({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: AuthCalloutProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-10 text-center shadow-[0_28px_90px_-36px_rgba(15,118,110,0.35)] backdrop-blur-sm',
        className,
      )}
    >
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.4]'
        aria-hidden
      >
        <div className='absolute -right-16 -top-24 size-56 rounded-full bg-primary/25 blur-3xl' />
        <div className='absolute -bottom-20 -left-12 size-48 rounded-full bg-primary/15 blur-3xl' />
      </div>
      <div className='relative flex flex-col items-center'>
        <span className='mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/15'>
          <Icon className='size-8' strokeWidth={1.75} />
        </span>
        <h1 className='text-balance font-serif text-2xl font-medium italic tracking-tight text-foreground'>
          {title}
        </h1>
        <p className='mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground'>
          {description}
        </p>
        <Button
          asChild
          size='lg'
          className='mt-8 rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90'
        >
          <Link
            href={actionHref}
            className='inline-flex items-center justify-center gap-0'
          >
            {actionLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
