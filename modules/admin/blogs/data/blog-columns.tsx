import { z } from 'zod';
import { DateTimeFormat } from '@/lib/utils/date-time-format';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

import { blogColumnSchema } from '../schemas/blog-column-schema';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconGripVertical,
} from '@tabler/icons-react';

import { useSortable } from '@dnd-kit/sortable';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const STATUS_CONFIG: Record<
  PublishStatusEnum,
  { label: string; variant: BadgeVariant }
> = {
  [PublishStatusEnum.DRAFT]: { label: 'Draft', variant: 'outline' },
  [PublishStatusEnum.PUBLISHED]: { label: 'Published', variant: 'default' },
  [PublishStatusEnum.ARCHIVED]: { label: 'Archived', variant: 'secondary' },
};

function getStatusConfig(status: string | null | undefined): {
  label: string;
  variant: BadgeVariant;
} {
  const key = status as PublishStatusEnum | undefined;
  return (
    STATUS_CONFIG[key ?? PublishStatusEnum.DRAFT] ??
    STATUS_CONFIG[PublishStatusEnum.DRAFT]
  );
}

type BlogStatusCellProps = {
  status: string | null | undefined;
  deletedAt: Date | null | undefined;
};

function BlogStatusCell({ status, deletedAt }: BlogStatusCellProps) {
  const { label, variant } = getStatusConfig(status);
  return (
    <div className='flex flex-col gap-1.5 min-w-0 max-w-[120px]'>
      <Badge variant={variant} className='w-fit text-xs'>
        {label}
      </Badge>
      {deletedAt ? (
        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
          <IconCircleXFilled className='size-3.5 shrink-0 fill-red-500 dark:fill-red-400' />
          <span className='truncate'>{DateTimeFormat(deletedAt)}</span>
        </div>
      ) : (
        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
          <IconCircleCheckFilled className='size-3.5 shrink-0 fill-emerald-500 dark:fill-emerald-400' />
          <span>Active</span>
        </div>
      )}
    </div>
  );
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

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

export const BlogColumns = (
  onEdit: (id: number) => void,
  onSoftDelete: (id: number) => void,
  onRestore: (id: number) => void,
  onDelete: (id: number) => void,
  onStatusChange: (id: number, status: PublishStatusEnum) => void,
): ColumnDef<z.infer<typeof blogColumnSchema>>[] => [
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
    accessorKey: 'title',
    header: 'Blog Title',
    enableHiding: false,
    cell: ({ getValue }) => (
      <div className='min-w-0 max-w-[280px] wrap-break-word whitespace-normal py-2'>
        {getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Dates',
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      const updatedAt = row.original.updatedAt;
      const publishedOn = row.original.publishedOn;
      return (
        <div className='flex flex-col gap-1 text-xs min-w-0 max-w-[240px]'>
          <div className='flex flex-col'>
            <span className='font-medium'>Created At:</span>
            <span>{DateTimeFormat(createdAt)}</span>
          </div>

          {publishedOn && (
            <div>
              <span className='font-medium'>Published At:</span>{' '}
              <span>{DateTimeFormat(publishedOn)}</span>
            </div>
          )}

          <div className='border-t border-dashed border-border my-1' />

          <div className='flex flex-col'>
            <span className='font-medium'>Updated At:</span>
            <span>{DateTimeFormat(updatedAt)}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'available',
    header: 'Status',
    cell: ({ row }) => (
      <BlogStatusCell
        status={row.original.status}
        deletedAt={row.original.deletedAt}
      />
    ),
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

        <DropdownMenuContent align='end' className='w-40'>
          {!row.original.deletedAt && (
            <div>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange(row.original.id, PublishStatusEnum.DRAFT)
                    }
                  >
                    Set as Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange(
                        row.original.id,
                        PublishStatusEnum.PUBLISHED,
                      )
                    }
                  >
                    Set as Published
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange(
                        row.original.id,
                        PublishStatusEnum.ARCHIVED,
                      )
                    }
                  >
                    Set as Archived
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
          )}
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
          <DropdownMenuItem
            variant='destructive'
            onClick={() => onDelete(row.original.id)}
          >
            Permanent Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
