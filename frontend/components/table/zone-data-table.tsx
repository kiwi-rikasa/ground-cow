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
  IconDotsVertical,
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  ZonePublic,
  updateZoneZoneZoneIdPatch,
  getZoneZoneZoneIdGet,
  deleteZoneZoneZoneIdDelete,
} from "@/app/client";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateZoneDialog } from "@/components/create-zone-dialog";

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
  handleSelectedZone: (zone: Row<ZonePublic>) => void;
  handleDeletion: (zone: Row<ZonePublic>) => void;
}

export function ColumnDefinitionHandler({
  handleSelectedZone,
  handleDeletion,
}: ColumnDefinitionHandlerProps): ColumnDef<ZonePublic>[] {
  const columns: ColumnDef<ZonePublic>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.zone_id} />,
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
      accessorKey: "zone_name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left cursor-pointer"
            onClick={() => handleSelectedZone(row)}
          >
            {row.original.zone_name}
          </Button>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "zone_regions",
      header: "Regions",
      cell: ({ row }) => (
        <div className="w-48">
          <span className="text-muted-foreground">
            {row.original.zone_regions}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "zone_note",
      header: "Note",
      cell: ({ row }) => (
        <div className="w-64">
          <span className="text-muted-foreground truncate">
            {row.original.zone_note}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "zone_created_at",
      header: "Created At",
      cell: ({ row }) => {
        const formattedTime = row.original.zone_created_at
          ? format(row.original.zone_created_at, "yyyy-MM-dd HH:mm:ss")
          : "-";
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
            <DropdownMenuItem onClick={() => handleSelectedZone(row)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Zone</DropdownMenuItem>
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

function DraggableRow({ row, index }: { row: Row<ZonePublic>; index: number }) {
  const rowId = row.id || `row-${index}`;
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: rowId,
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
        <TableCell key={cell.id || `cell-${row.id}-${cell.column.id}`}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function ZoneDataTable({
  data,
  setData,
}: {
  data: ZonePublic[];
  setData: React.Dispatch<React.SetStateAction<ZonePublic[]>>;
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
  const [selectedZone, setSelectedZone] =
    React.useState<Row<ZonePublic> | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () =>
      data?.map(({ zone_id }, index) => zone_id?.toString() || `item-${index}`),
    [data]
  );

  function handleSelectedZone(zone: Row<ZonePublic>) {
    setSelectedZone(zone);
    setDrawerOpen(true);
  }

  const handleDeletion = async (zone: Row<ZonePublic>) => {
    try {
      await deleteZoneZoneZoneIdDelete({
        path: {
          zone_id: zone.original.zone_id,
        },
      });
      setData((prev) =>
        prev.filter((item) => item.zone_id !== zone.original.zone_id)
      );
      toast({ message: "Zone deleted successfully", type: "success" });
    } catch (error) {
      console.error("Zone deletion failed", error);
      toast({ message: "Failed to delete zone", type: "error" });
    }
  };

  const handleZoneCreated = (newZone: ZonePublic) => {
    setData((prev) => [...prev, newZone]);
  };

  const columns = ColumnDefinitionHandler({
    handleSelectedZone,
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
    getRowId: (row, index) => row.zone_id?.toString() || `row-${index}`,
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
        toast({ message: "Zone order updated", type: "success" });
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
              placeholder="Search zones..."
              value={
                (table.getColumn("zone_name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("zone_name")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <CreateZoneDialog onZoneCreated={handleZoneCreated} />
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
      </Tabs>
      {selectedZone && (
        <ZoneDetailViewer
          item={selectedZone.original}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedZone(null);
          }}
          setData={setData}
        />
      )}
    </>
  );
}

function ZoneDetailViewer({
  item,
  setData,
  open,
  onOpenChange,
}: {
  item: ZonePublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<ZonePublic[]>>;
}) {
  const isMobile = useIsMobile();

  const [zoneName, setZoneName] = React.useState(item.zone_name);
  const [zoneRegions, setZoneRegions] = React.useState(item.zone_regions);
  const [zoneNote, setZoneNote] = React.useState(item.zone_note);

  const handleUpdate = async () => {
    try {
      await updateZoneZoneZoneIdPatch({
        body: {
          zone_name: zoneName,
          zone_regions: zoneRegions,
          zone_note: zoneNote,
        },
        path: {
          zone_id: item.zone_id,
        },
      });

      const res = await getZoneZoneZoneIdGet({
        path: { zone_id: item.zone_id },
      });

      const updatedZone = res.data;
      if (!updatedZone) {
        toast({ message: "Failed to get updated zone", type: "error" });
        return;
      }

      setData((prev) =>
        prev.map((zone) =>
          zone.zone_id === updatedZone.zone_id ? updatedZone : zone
        )
      );

      toast({ message: "Zone updated successfully", type: "success" });
      onOpenChange(false); // Close drawer on successful update
    } catch (error) {
      console.error("Zone update failed", error);
      toast({ message: "Failed to update zone", type: "error" });
    }
  };

  // Update state when item changes
  React.useEffect(() => {
    setZoneName(item.zone_name);
    setZoneRegions(item.zone_regions);
    setZoneNote(item.zone_note);
  }, [item]);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Zone Details: {item.zone_name}</DrawerTitle>
          <DrawerDescription>
            Zone information and configuration
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Label htmlFor="zone_name">Name</Label>
              <Input
                id="zone_name"
                className="w-full"
                value={zoneName ?? ""}
                onChange={(e) => setZoneName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="zone_regions">Regions</Label>
              <Input
                id="zone_regions"
                className="w-full"
                value={zoneRegions}
                onChange={(e) => setZoneRegions(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="zone_note">Note</Label>
              <Textarea
                id="zone_note"
                className="w-full"
                value={zoneNote}
                onChange={(e) => setZoneNote(e.target.value)}
                placeholder="Add a note for this zone"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Label htmlFor="zone_created_at">Created At</Label>
              <div
                id="zone_created_at"
                className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
              >
                {item.zone_created_at
                  ? format(item.zone_created_at, "yyyy-MM-dd HH:mm:ss")
                  : "-"}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="zone_id">Zone ID</Label>
              <div
                id="zone_id"
                className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
              >
                {item.zone_id}
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button className="cursor-pointer" onClick={handleUpdate}>
            Save Changes
          </Button>
          <DrawerClose asChild>
            <Button className="cursor-pointer" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
