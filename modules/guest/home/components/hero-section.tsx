'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, type ReactElement } from 'react';

import { Blog } from '@/lib/interfaces/blog';
import { BlogAuthorAvatar } from '@/modules/guest/common/components/blog-author-avatar';
import { extractPlainTextFromHtml } from '@/lib/utils/extract-plain-text-from-html';
import { estimateReadingMinutesFromHtml } from '@/lib/utils/blog-read';

type HeroSectionProps = Readonly<{
  data: Blog;
}>;

const HeroSection = ({ data }: HeroSectionProps): ReactElement => {
  const authorName =
    [data.author.firstName, data.author.lastName].filter(Boolean).join(' ') ||
    data.author.firstName ||
    'Author';

  const publishedShort =
    data.publishedOn &&
    !Number.isNaN(new Date(data.publishedOn).getTime())
      ? new Date(data.publishedOn).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  const readMinutes = estimateReadingMinutesFromHtml(data.content);

  const heroImageSrc: string =
    data.thumbnail?.path?.trim() ||
    data.pictures?.[0]?.path?.trim() ||
    '/images/dev-hero.jpg';
  const heroImageAlt: string = data.title
    ? `Hero image for ${data.title}`
    : 'Hero image';

  const excerpt = useMemo(
    () => extractPlainTextFromHtml(data.content, 320),
    [data.content],
  );

  return (
    <section className='relative mb-12 border-b border-border/30 py-12 md:mb-24 md:py-20'>
      <div className='mx-auto max-w-4xl text-center'>
        <span className='mb-6 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary'>
          Featured Editorial
        </span>

        <h1 className='mb-8 font-serif text-5xl font-medium italic leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl'>
          <Link
            href={`/blogs/${data.slug}`}
            className='rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          >
            {data.title}
          </Link>
        </h1>

        {excerpt ? (
          <p className='mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
            {excerpt}
          </p>
        ) : null}

        <div className='flex flex-col items-center gap-8'>
          <div className='flex items-center gap-3'>
            <BlogAuthorAvatar
              author={data.author}
              size='md'
              className='grayscale'
            />
            <div className='text-left'>
              <p className='text-xs font-bold text-foreground'>{authorName}</p>
              <p className='text-[10px] font-medium uppercase tracking-widest text-muted-foreground'>
                {publishedShort} • {readMinutes} min read
              </p>
            </div>
          </div>

          <Link
            href={`/blogs/${data.slug}`}
            className='inline-flex items-center justify-center rounded-full bg-foreground px-12 py-4 text-sm font-bold tracking-tight text-background shadow-lg shadow-foreground/10 transition-all hover:scale-105 hover:bg-foreground/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          >
            Read Full Story
          </Link>
        </div>
      </div>

      <div className='mx-auto mt-16 max-w-5xl md:mt-20'>
        <Link
          href={`/blogs/${data.slug}`}
          className='group relative block aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        >
          <Image
            src={heroImageSrc}
            fill
            sizes='(max-width: 1024px) 100vw, 64rem'
            alt={heroImageAlt}
            priority
            className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]'
          />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
