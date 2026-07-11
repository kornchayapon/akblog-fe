import { ColumnDef } from '@tanstack/react-table';

import z from 'zod';

import { DateTimeFormat } from '@/lib/utils/date-time-format';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconGripVertical,
} from '@tabler/icons-react';

import { useSortable } from '@dnd-kit/sortable';

import { userColumnSchema } from '../schemas/user-column-schema';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export const UserColumns = (
  onEdit: (id: number) => void,
  onSoftDelete: (id: number) => void,
  onRestore: (id: number) => void,
): ColumnDef<z.infer<typeof userColumnSchema>>[] => [
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
    accessorKey: 'firstName',
    header: 'User',
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <p>{row.original.firstName + ' ' + row.original.lastName}</p>
        <p>{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div>
        <span className='capitalize'>{row.original.role}</span>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      const updatedAt = row.original.updatedAt;
      return (
        <div className='flex flex-col gap-1 text-xs min-w-0 max-w-[140px]'>
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
    accessorKey: 'verified',
    header: 'Email Verified',
    cell: ({ row }) => {
      const isVerified = row.original.verified === true;

      return (
        <Badge variant='outline' className='text-muted-foreground px-1.5'>
          <div className='flex items-center gap-1'>
            {isVerified ? (
              <IconCircleCheckFilled className='size-4 fill-emerald-500 dark:fill-emerald-400' />
            ) : (
              <IconCircleXFilled className='size-4 fill-yellow-500 dark:fill-yellow-400' />
            )}
            <span>{isVerified ? 'Verified' : 'Unverified'}</span>
          </div>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { deletedAt, active } = row.original;

      if (deletedAt) {
        return (
          <Badge variant='outline' className='text-muted-foreground px-1.5'>
            <div className='flex items-center gap-1'>
              <IconCircleXFilled className='size-4 fill-red-500 dark:fill-red-400' />
              <span>Deleted</span>
            </div>
          </Badge>
        );
      }

      if (!active) {
        return (
          <Badge variant='outline' className='text-muted-foreground px-1.5'>
            <div className='flex items-center gap-1'>
              <IconCircleXFilled className='size-4 fill-yellow-500 dark:fill-yellow-400' />
              <span>Suspended</span>
            </div>
          </Badge>
        );
      }

      return (
        <Badge variant='outline' className='text-muted-foreground px-1.5'>
          <div className='flex items-center gap-1'>
            <IconCircleCheckFilled className='fill-emerald-500 dark:fill-emerald-400' />
            <span>Active</span>
          </div>
        </Badge>
      );
    },
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
          <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
            Update
          </DropdownMenuItem>
          {row.original.deletedAt ? (
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onRestore(row.original.id)}
            >
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
