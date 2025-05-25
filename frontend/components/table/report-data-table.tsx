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
import { ReportPublic } from "@/app/client/types.gen";
import {
  updateReportReportReportIdPatch,
  getReportReportReportIdGet,
  deleteReportReportReportIdDelete,
} from "@/app/client/";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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
  handleSelectedReport: (report: Row<ReportPublic>) => void;
  handleDeletion: (report: Row<ReportPublic>) => void;
}

export function ColumnDefinitionHandler({
  handleSelectedReport,
  handleDeletion,
}: ColumnDefinitionHandlerProps): ColumnDef<ReportPublic>[] {
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
      accessorKey: "report_id",
      header: "ID",
      cell: ({ row }) => {
        return (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left cursor-pointer"
            onClick={() => handleSelectedReport(row)}
          >
            {row.original.report_id}
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
            {row.original.alert?.zone?.zone_name ?? "N/A"}
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
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        return (
          <div className="w-32">
            {row.original.user?.user_name ? row.original.user?.user_name : "-"}
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
            <DropdownMenuItem onClick={() => handleSelectedReport(row)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>View Alerts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDeletion(row)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  return columns;
}

function DraggableRow({
  row,
  handleSelectedReport,
}: {
  row: Row<ReportPublic>;
  handleSelectedReport?: (report: Row<ReportPublic>) => void;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.report_id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        "relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80",
        handleSelectedReport && "cursor-pointer"
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      onClick={() => handleSelectedReport && handleSelectedReport(row)}
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

  const [selectedReport, setSelectedReport] =
    React.useState<Row<ReportPublic> | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

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

  function handleSelectedReport(report: Row<ReportPublic>) {
    setSelectedReport(report);
    setDrawerOpen(true);
  }

  const handleDeletion = async (report: Row<ReportPublic>) => {
    try {
      await deleteReportReportReportIdDelete({
        path: {
          report_id: report.original.report_id,
        },
      });
      setData((prev) =>
        prev.filter((item) => item.report_id !== report.original.report_id)
      );
      toast({ message: "Report deleted successfully", type: "success" });
    } catch (error) {
      console.error("Report deletion failed", error);
      toast({ message: "Failed to delete report", type: "error" });
    }
  };

  const columns = ColumnDefinitionHandler({
    handleSelectedReport,
    handleDeletion,
  });

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
    <>
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
                        <DraggableRow
                          key={row.id}
                          row={row}
                          handleSelectedReport={handleSelectedReport}
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
      {selectedReport && (
        <TableCellViewer
          item={selectedReport.original}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedReport(null);
          }}
          setData={setData}
        />
      )}
    </>
  );
}

function TableCellViewer({
  item,
  open,
  onOpenChange,
  setData,
}: {
  item: ReportPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<ReportPublic[]>>;
}) {
  const isMobile = useIsMobile();

  const [actionFlag, setActionFlag] = React.useState(item.report_action_flag);
  const [damageFlag, setDamageFlag] = React.useState(item.report_damage_flag);

  const handleUpdate = async () => {
    try {
      await updateReportReportReportIdPatch({
        body: {
          report_action_flag: actionFlag,
          report_damage_flag: damageFlag,
        },
        path: {
          report_id: item.report_id,
        },
      });

      const res = await getReportReportReportIdGet({
        path: { report_id: item.report_id },
      });

      const updatedReport = res.data;
      if (!updatedReport) {
        toast({ message: "Failed to get updated report", type: "error" });
        return;
      }

      setData((prev) =>
        prev.map((report) =>
          report.report_id === updatedReport.report_id ? updatedReport : report
        )
      );

      toast({ message: "Report updated successfully", type: "success" });
    } catch (error) {
      console.error("Report update failed", error);
      toast({ message: "Failed to update report", type: "error" });
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle className="text-2xl font-bold">
            Report #{item.report_id}
          </DrawerTitle>
          <DrawerDescription>
            Report details and related information
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="text-lg font-bold flex items-center gap-1">
            Event #{item.alert?.event?.event_id}{" "}
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <IconExternalLink />
            </Button>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="event_intensity">Event Intensity</Label>
              </div>
              <div id="event_intensity" className="w-full py-2 rounded-md">
                {item.alert?.event?.event_intensity}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="event_severity">Event Severity</Label>
              </div>
              <div id="event_severity" className="w-full py-2 rounded-md">
                {item.alert?.event?.event_severity}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="event_created_at">Created At</Label>
              </div>
              <div id="event_created_at" className="w-full py-2 rounded-md">
                {item.alert?.event?.event_created_at
                  ? format(
                      item.alert.event.event_created_at,
                      "yyyy-MM-dd HH:mm:ss"
                    )
                  : "-"}
              </div>
            </div>
          </div>
          <Separator />
          <div className="text-lg font-bold flex items-center gap-1">
            Alert #{item.alert?.alert_id}{" "}
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <IconExternalLink />
            </Button>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="alert_state">Alert State</Label>
              </div>
              <div id="alert_state" className="w-full py-2 rounded-md">
                {item.alert?.alert_state}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between">
              <div className="flex gap-3 w-full">
                <Label htmlFor="zone_name">Zone</Label>
              </div>
              <div id="zone_name" className="w-full py-2 rounded-md">
                {item.alert?.zone?.zone_name}
              </div>
            </div>
          </div>
          <Separator />
          {!isMobile && (
            <>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label className="font-bold" htmlFor="reportedAt">
                      Reported At
                    </Label>
                    <div id="reportedAt" className="w-full py-2 rounded-md">
                      {format(
                        new Date(item.report_reported_at),
                        "yyyy-MM-dd HH:mm:ss"
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label className="font-bold" htmlFor="userId">
                      User Name
                    </Label>
                    <div id="userId" className="w-full py-2 rounded-md">
                      {item.user?.user_name ? item.user.user_name : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label className="font-bold" htmlFor="actionFlag">
                  Action Flag
                </Label>
                <Select
                  value={actionFlag ? "true" : "false"}
                  onValueChange={(value) => setActionFlag(value === "true")}
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
                <Label className="font-bold" htmlFor="damageFlag">
                  Damage Flag
                </Label>
                <Select
                  value={damageFlag ? "true" : "false"}
                  onValueChange={(value) => setDamageFlag(value === "true")}
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
          </form>
        </div>
        <DrawerFooter>
          <Button className="cursor-pointer" onClick={handleUpdate}>
            Update
          </Button>
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
