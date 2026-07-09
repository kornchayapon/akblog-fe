'use client';

import * as React from 'react';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
} from '@tabler/icons-react';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';

// must have ID for drag & drop
interface BaseData {
  id: string | number;
  [key: string]: unknown;
}

// Generic function
function DraggableRow<TData extends BaseData>({ row }: { row: Row<TData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Generic Type TData
type DataTableBaseProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  createTitle?: string;
  onCreate?: () => void;
};

type DataTablePaginationProps = {
  // pagination params
  pageCount: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  totalCount: number;
};

type DataTableNoPaginationProps = {
  pageCount?: undefined;
  pageIndex?: undefined;
  onPageChange?: undefined;
  totalCount?: undefined;
};

export type DataTableProps<TData> = DataTableBaseProps<TData> &
  (DataTablePaginationProps | DataTableNoPaginationProps);

function hasPagination<TData>(
  props: DataTableProps<TData>,
): props is DataTableBaseProps<TData> & DataTablePaginationProps {
  return (
    typeof props.pageCount === 'number' &&
    typeof props.pageIndex === 'number' &&
    typeof props.totalCount === 'number' &&
    typeof props.onPageChange === 'function'
  );
}

// Generic function of the Main component
export function DataTable<TData extends BaseData>(
  props: DataTableProps<TData>,
) {
  const { data: initialData, columns, onCreate, createTitle } = props;
  const havePagination = hasPagination(props);

  const [data, setData] = React.useState<TData[]>(() =>
    Array.isArray(initialData) ? initialData : [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  React.useEffect(() => {
    setData(Array.isArray(initialData) ? initialData : []);
  }, [initialData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => (Array.isArray(data) ? data.map(({ id }) => id) : []),
    [data],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    manualPagination: havePagination, // we handle it ourselves when pagination is provided
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue='outline'
      className='w-full min-w-0 flex-col justify-start gap-6'
    >
      <div className='flex items-center justify-between px-4 lg:px-6'>
        <div className='flex items-center justify-end w-full gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <IconLayoutColumns />
                <span className='hidden lg:inline'>Customize Columns</span>
                <span className='lg:hidden'>Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {createTitle && onCreate && (
            <Button variant='outline' size='sm' onClick={onCreate}>
              <IconPlus />
              <span className='hidden lg:inline'>{createTitle}</span>
            </Button>
          )}
        </div>
      </div>
      <TabsContent
        value='outline'
        className='relative flex flex-col gap-4 px-4 lg:px-6'
      >
        <div className='min-w-0 overflow-x-auto rounded-lg border'>
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className='bg-muted sticky top-0 z-10'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className='**:data-[slot=table-cell]:first:w-8'>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* pagination */}
        {havePagination && (
          <div className='flex items-center justify-between px-4'>
            <div className='text-muted-foreground hidden flex-1 text-sm lg:flex'>
              {`Total ${props.totalCount.toLocaleString()} items`}
            </div>
            {props.pageCount > 1 && (
              <div className='flex w-full items-center gap-8 lg:w-fit'>
                <div className='flex w-fit items-center justify-center text-sm font-medium'>
                  Page {props.pageIndex} of {props.pageCount}
                </div>
                <div className='ml-auto flex items-center gap-2 lg:ml-0'>
                  <Button
                    variant='outline'
                    className='hidden h-8 w-8 p-0 lg:flex'
                    onClick={() => props.onPageChange(1)}
                    disabled={props.pageIndex === 1}
                  >
                    <span className='sr-only'>Go to first page</span>
                    <IconChevronsLeft />
                  </Button>
                  <Button
                    variant='outline'
                    className='size-8'
                    size='icon'
                    onClick={() => props.onPageChange(props.pageIndex - 1)}
                    disabled={props.pageIndex === 1}
                  >
                    <span className='sr-only'>Go to previous page</span>
                    <IconChevronLeft />
                  </Button>
                  <Button
                    variant='outline'
                    className='size-8'
                    size='icon'
                    onClick={() => props.onPageChange(props.pageIndex + 1)}
                    disabled={props.pageIndex >= props.pageCount}
                  >
                    <span className='sr-only'>Go to next page</span>
                    <IconChevronRight />
                  </Button>
                  <Button
                    variant='outline'
                    className='hidden size-8 lg:flex'
                    size='icon'
                    onClick={() => props.onPageChange(props.pageCount)}
                    disabled={props.pageIndex >= props.pageCount}
                  >
                    <span className='sr-only'>Go to last page</span>
                    <IconChevronsRight />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>
      <TabsContent
        value='past-performance'
        className='flex flex-col px-4 lg:px-6'
      >
        <div className='aspect-video w-full flex-1 rounded-lg border border-dashed'></div>
      </TabsContent>
      <TabsContent value='key-personnel' className='flex flex-col px-4 lg:px-6'>
        <div className='aspect-video w-full flex-1 rounded-lg border border-dashed'></div>
      </TabsContent>
      <TabsContent
        value='focus-documents'
        className='flex flex-col px-4 lg:px-6'
      >
        <div className='aspect-video w-full flex-1 rounded-lg border border-dashed'></div>
      </TabsContent>
    </Tabs>
  );
}
