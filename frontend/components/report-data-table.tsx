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
  IconGripVertical,
  IconLayoutColumns,
  IconXboxXFilled,
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
  DrawerTrigger,
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
import { Textarea } from "@/components/ui/textarea";
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
import { ReportPublic } from "@/app/client/types.gen";

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

const columns: ColumnDef<ReportPublic>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.report_id} />,
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "report_id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <div className="w-16">
          <TableCellViewer item={row.original} />
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "report_action_flag",
    header: "Action",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.report_action_flag ? (
            <IconCircleCheckFilled
              className="fill-green-500 dark:fill-green-400"
              role="icon"
            />
          ) : (
            <IconXboxXFilled
              className="fill-red-500 dark:fill-red-400"
              role="icon"
            />
          )}
          {row.original.report_action_flag ? "True" : "False"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "report_damage_flag",
    header: "Damage",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.report_damage_flag ? "True" : "False"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "report_factory_zone",
    header: "Factory Zone",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.report_factory_zone ?? "N/A"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "report_reported_at",
    header: "Reported At",
    cell: ({ row }) => {
      const formattedTime = format(
        new Date(row.original.report_reported_at),
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
    accessorKey: "report_created_at",
    header: "Created At",
    cell: ({ row }) => {
      const formattedTime = format(
        new Date(row.original.report_created_at),
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
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }) => {
      return (
        <div className="w-32">
          {row.original.user_id ? row.original.user_id : "-"}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "alert_id",
    header: "Alert ID",
    cell: ({ row }) => {
      return (
        <div className="w-32">
          {row.original.alert_id ? row.original.alert_id : "-"}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: () => (
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
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>View Alerts</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<ReportPublic> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.report_id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
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

export function ReportDataTable({
  data,
  setData,
}: {
  data: ReportPublic[];
  setData: React.Dispatch<React.SetStateAction<ReportPublic[]>>;
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
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ report_id }) => report_id) || [],
    [data]
  );

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
    getRowId: (row) => row.report_id.toString(),
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
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      setData(arrayMove([...data], oldIndex, newIndex));
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search reports..."
            value={
              (table.getColumn("report_id")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("report_id")?.setFilterValue(event.target.value)
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
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
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
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({ item }: { item: ReportPublic }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left cursor-pointer"
        >
          {item.report_id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Report #{item.report_id}</DrawerTitle>
          <DrawerDescription>
            Please provide the detailed report information.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="reportedAt">Reported At</Label>
                  <div
                    id="reportedAt"
                    className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
                  >
                    {format(
                      new Date(item.report_reported_at),
                      "yyyy-MM-dd HH:mm:ss"
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="createdAt">Created At</Label>
                  <div
                    id="createdAt"
                    className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
                  >
                    {format(
                      new Date(item.report_created_at),
                      "yyyy-MM-dd HH:mm:ss"
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="userId">User ID</Label>
                  <div
                    id="userId"
                    className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
                  >
                    {item.user_id ? item.user_id : "N/A"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="alertId">Alert ID</Label>
                  <div
                    id="alertId"
                    className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
                  >
                    {item.alert_id ? item.alert_id : "N/A"}
                  </div>
                </div>
              </div>
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="actionFlag">Action Flag</Label>
                <Select
                  defaultValue={item.report_action_flag ? "true" : "false"}
                >
                  <SelectTrigger
                    id="actionFlag"
                    className="w-full cursor-pointer"
                  >
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="cursor-pointer">
                      True
                    </SelectItem>
                    <SelectItem value="false" className="cursor-pointer">
                      False
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="damageFlag">Damage Flag</Label>
                <Select
                  defaultValue={item.report_damage_flag ? "true" : "false"}
                >
                  <SelectTrigger
                    id="damageFlag"
                    className="w-full cursor-pointer"
                  >
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="cursor-pointer">
                      True
                    </SelectItem>
                    <SelectItem value="false" className="cursor-pointer">
                      False
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="factoryZone">Factory Zone</Label>
                <Input
                  id="factoryZone"
                  type="number"
                  defaultValue={item.report_factory_zone?.toString() || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="descriptions">Additional Notes</Label>
                <Textarea id="descriptions" defaultValue={""} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="attachments">Attachments</Label>
                <Input id="attachments" type="file" />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button className="cursor-pointer">Submit</Button>
          <DrawerClose asChild>
            <Button className="cursor-pointer" variant="outline">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
