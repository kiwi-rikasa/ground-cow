"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconExternalLink,
  IconGripVertical,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "@/components/ui/toast";

import { EventPublic } from "@/app/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

interface ColumnDefinitionHandlerProps {
  handleSelectedEvent: (report: Row<EventPublic>) => void;
}

export function ColumnDefinitionHandler({
  handleSelectedEvent,
}: ColumnDefinitionHandlerProps): ColumnDef<EventPublic>[] {
  const columns: ColumnDef<EventPublic>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.event_id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="cursor-pointer"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "event_id",
      header: "Event ID",
      cell: ({ row }) => {
        return (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left cursor-pointer"
            onClick={() => handleSelectedEvent(row)}
          >
            {row.original.event_id}
          </Button>
        );
      },
      enableHiding: false,
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        return String(value ?? "") === String(filterValue);
      },
    },
    {
      accessorKey: "event_severity",
      header: "Severity",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.event_severity === "L2" ? (
              <IconCircleCheckFilled
                className="fill-red-500 dark:fill-red-400"
                role="icon"
              />
            ) : row.original.event_severity === "L1" ? (
              <IconCircleCheckFilled
                className="fill-yellow-500 dark:fill-yellow-400"
                role="icon"
              />
            ) : (
              <IconCircleCheckFilled
                className="fill-blue-500 dark:fill-blue-400"
                role="icon"
              />
            )}
            {row.original.event_severity}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "event_intensity",
      header: "Intensity",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.event_intensity !== undefined &&
            row.original.event_intensity !== null
              ? row.original.event_intensity.toFixed(1)
              : "-"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "earthquake_id",
      header: "Earthquake ID",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.earthquake_id || "-"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "zone",
      header: "Zone",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.zone?.zone_name || "-"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "event_created_at",
      header: "Created At",
      cell: ({ row }) => {
        const formattedTime = format(
          row.original.event_created_at,
          "yyyy-MM-dd HH:mm:ss"
        );
        return (
          <div className="w-48">
            <span>{formattedTime}</span>
          </div>
        );
      },
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild role="button">
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8 cursor-pointer"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleSelectedEvent(row)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>View Alerts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  return columns;
}

function DraggableRow({
  row,
  index,
  handleSelectedEvent,
}: {
  row: Row<EventPublic>;
  index: number;
  handleSelectedEvent?: (event: Row<EventPublic>) => void;
}) {
  const rowId = row.id || `row-${index}`;
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: rowId,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        "relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80",
        handleSelectedEvent && "cursor-pointer"
      )}
      onClick={() => handleSelectedEvent && handleSelectedEvent(row)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id || `cell-${row.id}-${cell.column.id}`}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function EventDataTable({
  data,
  setData,
}: {
  data: EventPublic[];
  setData: React.Dispatch<React.SetStateAction<EventPublic[]>>;
}) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedEvent, setSelectedEvent] =
    React.useState<Row<EventPublic> | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () =>
      data?.map(
        ({ event_id }, index) => event_id?.toString() || `item-${index}`
      ),
    [data]
  );

  function handleSelectedEvent(report: Row<EventPublic>) {
    setSelectedEvent(report);
    setDrawerOpen(true);
  }
  const columns = ColumnDefinitionHandler({ handleSelectedEvent });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row, index) => row.event_id?.toString() || `row-${index}`,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
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
        toast({ message: "Event order updated", type: "success" });
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <Tabs
        defaultValue="outline"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search tasks..."
              value={
                (table.getColumn("event_id")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("event_id")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline ">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize cursor-pointer"
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
          </div>
        </div>
        <TabsContent
          value="outline"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} role="row">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            role="header"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row, index) => (
                        <DraggableRow
                          key={row.id || `unique-row-${index}`}
                          row={row}
                          index={index}
                          handleSelectedEvent={handleSelectedEvent}
                        />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-20 cursor-pointer"
                    id="rows-per-page"
                  >
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem
                        key={pageSize}
                        value={`${pageSize}`}
                        className="cursor-pointer"
                      >
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8 cursor-pointer"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8 cursor-pointer"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex cursor-pointer"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="past-performance"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="key-personnel"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="focus-documents"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
      </Tabs>
      {selectedEvent && (
        <TableCellViewer
          item={selectedEvent.original}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedEvent(null);
          }}
        />
      )}
    </>
  );
}

function TableCellViewer({
  item,
  open,
  onOpenChange,
}: {
  item: EventPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle className="text-2xl font-bold">
            Event #{item.event_id}
          </DrawerTitle>
          <DrawerDescription>
            Event details and related information
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="text-lg font-bold flex items-center gap-1">
            Earthquake #{item.earthquake?.earthquake_id}{" "}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => {
                router.push(`/earthquakes/${item.earthquake?.earthquake_id}`);
              }}
            >
              <IconExternalLink />
            </Button>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="earthquake_magnitude">Magnitude</Label>
              </div>
              <div id="earthquake_magnitude" className="w-full py-2 rounded-md">
                {item.earthquake?.earthquake_magnitude}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="earthquake_occurred_at">Occurred At</Label>
              </div>
              <div
                id="earthquake_occurred_at"
                className="w-full py-2 rounded-md"
              >
                {item.earthquake?.earthquake_occurred_at
                  ? format(
                      item.earthquake.earthquake_occurred_at,
                      "yyyy-MM-dd HH:mm:ss"
                    )
                  : "-"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="earthquake_source">Source</Label>
              </div>
              <div id="earthquake_source" className="w-full py-2 rounded-md">
                {item.earthquake.earthquake_source}
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label className="font-bold" htmlFor="event_created_at">
                Created At
              </Label>
              <div id="event_created_at" className="w-full py-2 rounded-md">
                {item.event_created_at
                  ? format(item.event_created_at, "yyyy-MM-dd HH:mm:ss")
                  : "-"}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label className="font-bold" htmlFor="event_severity">
                Severity
              </Label>
              <div id="event_severity" className="w-full py-2 rounded-md">
                {item.event_severity !== undefined &&
                item.event_severity !== null
                  ? item.event_severity
                  : "-"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label className="font-bold" htmlFor="zone_id">
                Zone
              </Label>
              <div id="zone_id" className="w-full py-2 rounded-md">
                {item.zone?.zone_name || "-"}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label className="font-bold" htmlFor="event_intensity">
                Intensity
              </Label>
              <div id="event_intensity" className="w-full py-2 rounded-md">
                {item.event_intensity !== undefined &&
                item.event_intensity !== null
                  ? item.event_intensity.toFixed(1)
                  : "-"}
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button className="cursor-pointer">Update</Button>
          <DrawerClose asChild>
            <Button className="cursor-pointer" variant="outline">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
