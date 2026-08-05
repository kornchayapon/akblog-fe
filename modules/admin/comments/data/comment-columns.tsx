'use client';

import { useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

import { DateTimeFormat } from '@/lib/utils/date-time-format';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconExternalLink,
  IconGripVertical,
} from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';

import { adminCommentColumnSchema } from '../schemas/comment-column-schema';

type AdminCommentRow = z.infer<typeof adminCommentColumnSchema>;

type CommentUser = NonNullable<AdminCommentRow['user']>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant='ghost'
      size='icon'
      className='text-muted-foreground size-7 hover:bg-transparent'
    >
      <IconGripVertical className='text-muted-foreground size-3' />
      <span className='sr-only'>Drag to reorder</span>
    </Button>
  );
}

function StatusCell({
  deletedAt,
}: Readonly<{ deletedAt?: string | null }>) {
  if (deletedAt) {
    return (
      <div className='flex items-center gap-1 text-xs text-muted-foreground min-w-0 max-w-[160px]'>
        <IconCircleXFilled className='size-3.5 shrink-0 fill-red-500 dark:fill-red-400' />
        <span className='truncate'>{DateTimeFormat(deletedAt)}</span>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
      <IconCircleCheckFilled className='size-3.5 shrink-0 fill-emerald-500 dark:fill-emerald-400' />
      <span>Active</span>
    </div>
  );
}

function ContentCell({ content }: Readonly<{ content: string }>) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const maxChars = 50;

  const { preview, canExpand } = useMemo(() => {
    const trimmed = content.trim();
    if (trimmed.length <= maxChars) {
      return { preview: trimmed, canExpand: false };
    }
    return { preview: `${trimmed.slice(0, maxChars)}…`, canExpand: true };
  }, [content]);

  return (
    <div className='min-w-0 max-w-[480px] whitespace-normal wrap-break-word py-2'>
      <div className='text-sm'>{expanded ? content : preview}</div>
      {canExpand && (
        <Button
          type='button'
          variant='link'
          size='sm'
          className='px-0 h-auto text-xs'
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide' : 'Full'}
        </Button>
      )}
    </div>
  );
}

function UserName({ user }: Readonly<{ user: CommentUser }>) {
  return (
    <span>
      {user.firstName}
      {user.lastName ? ` ${user.lastName}` : ''}
    </span>
  );
}

function UserCell({
  user,
  replyUser,
}: Readonly<{
  user: AdminCommentRow['user'];
  replyUser: AdminCommentRow['replyUser'];
}>) {
  if (!user) return <div className='text-muted-foreground text-xs'>—</div>;

  return (
    <div className='flex flex-col gap-1 text-xs min-w-0 max-w-[220px]'>
      <div className='flex items-center gap-1'>
        <span className='text-muted-foreground font-medium shrink-0'>By:</span>
        <span className='truncate font-medium'>
          <UserName user={user} />
        </span>
      </div>

      {replyUser && (
        <div className='flex items-center gap-1 text-muted-foreground'>
          <IconArrowRight className='size-3 shrink-0' />
          <span className='text-muted-foreground font-medium shrink-0'>
            To:
          </span>
          <span className='truncate'>
            <UserName user={replyUser} />
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

export type ViewBlogInfo = {
  /** Backend-provided slug used to open the public blog page. */
  blogSlug?: string | null;
};

export const CommentColumns = (
  onSoftDelete: (id: number) => void,
  onRestore: (id: number) => void,
  onViewBlog: (info: ViewBlogInfo) => void,
): ColumnDef<AdminCommentRow>[] => [
  {
    id: 'drag',
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          id='select-all'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          id={`select-row-${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'content',
    header: 'Comment',
    enableHiding: false,
    cell: ({ row }) => <ContentCell content={row.original.content} />,
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => (
      <UserCell user={row.original.user} replyUser={row.original.replyUser} />
    ),
    sortingFn: (a, b) => {
      const aName = a.original.user
        ? `${a.original.user.firstName} ${a.original.user.lastName ?? ''}`.trim()
        : '';
      const bName = b.original.user
        ? `${b.original.user.firstName} ${b.original.user.lastName ?? ''}`.trim()
        : '';
      return aName.localeCompare(bName);
    },
  },
  {
    accessorKey: 'isReply',
    header: 'Type',
    cell: ({ row }) =>
      row.original.isReply ? (
        <Badge variant='secondary' className='text-xs'>
          Reply
        </Badge>
      ) : (
        <Badge variant='outline' className='text-xs'>
          Comment
        </Badge>
      ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Dates',
    cell: ({ row }) => {
      const { createdAt, updatedAt } = row.original;

      return (
        <div className='flex flex-col gap-1 text-xs min-w-0 max-w-[180px]'>
          <div className='flex flex-col'>
            <span className='font-medium'>Created:</span>
            <span>{DateTimeFormat(createdAt)}</span>
          </div>

          <div className='border-t border-dashed border-border my-1' />

          <div className='flex flex-col'>
            <span className='font-medium'>Updated:</span>
            <span>{DateTimeFormat(updatedAt)}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'deletedAt',
    header: 'Status',
    cell: ({ row }) => <StatusCell deletedAt={row.original.deletedAt} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='data-[state=open]:bg-muted text-muted-foreground flex size-8'
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-44'>
          <DropdownMenuItem
            onClick={() => {
              onViewBlog({
                blogSlug: row.original.blogSlug,
              });
            }}
          >
            <IconExternalLink className='mr-2 size-4' />
            View Blog
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {row.original.deletedAt ? (
            <DropdownMenuItem onClick={() => onRestore(row.original.id)}>
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onSoftDelete(row.original.id)}
            >
              Soft Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
