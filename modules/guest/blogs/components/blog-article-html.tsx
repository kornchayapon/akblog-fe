import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';

type BlogArticleHtmlProps = Readonly<{
  html: string;
  className?: string;
}>;

/**
 * Renders trusted HTML from the CMS. Content should be sanitized server-side;
 * avoid passing untrusted strings from users.
 */
const BlogArticleHtml = ({
  html,
  className,
}: BlogArticleHtmlProps): ReactElement => {
  return (
    <div
      className={cn(
        'blog-article-html text-[17px] leading-[1.75] text-foreground',
        '[&_p]:mb-5 [&_p:last-child]:mb-0',
        '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/35 [&_a]:transition-colors hover:[&_a]:text-primary/85',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6',
        '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6',
        '[&_li]:my-2',
        '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/35 [&_blockquote]:bg-primary/6 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
        '[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:font-mono [&_code]:text-foreground',
        '[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-card [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-foreground',
        '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-28 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground',
        '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-28 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-foreground',
        '[&_hr]:my-10 [&_hr]:border-border/80',
        '[&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:shadow-primary/8',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default BlogArticleHtml;
