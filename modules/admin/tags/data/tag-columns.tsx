import { ColumnDef } from '@tanstack/react-table';
import { DateTimeFormat } from '@/lib/utils/date-time-format';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconGripVertical,
} from '@tabler/icons-react';

import { useSortable } from '@dnd-kit/sortable';

import { tagColumnSchema } from '../schemas/tag-column-schema';
import z from 'zod';

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

export const TagColumns = (
  onEdit: (id: number) => void,
  onPermanentDelete: (id: number) => void,
): ColumnDef<z.infer<typeof tagColumnSchema>>[] => [
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
    accessorKey: 'name',
    header: 'Name',
    enableHiding: false,
    cell: ({ getValue }) => (
      <div className='min-w-0 max-w-[280px] wrap-break-word whitespace-normal py-2'>
        {getValue() as string}
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
        <DropdownMenuContent align='end' className='w-32'>
          <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
            Update
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant='destructive'
            onClick={() => onPermanentDelete(row.original.id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
