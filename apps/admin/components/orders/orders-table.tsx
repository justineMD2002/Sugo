"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, User, Delivery } from "@/lib/types/database";

interface OrderWithDetails extends Order {
  customer: User;
  rider?: User;
  delivery?: Delivery;
}

interface OrdersTableProps {
  data: OrderWithDetails[];
  onViewOrder: (order: OrderWithDetails) => void;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string | undefined) => void;
  statusFilter?: string | undefined;
  isRefreshing?: boolean;
}

const createColumns = (
  onView: (order: OrderWithDetails) => void
): ColumnDef<OrderWithDetails>[] => [
    {
      accessorKey: "order_number",
      header: () => <div className="pl-4">Order Number</div>,
      cell: ({ row }) => (
        <div className="font-mono text-sm pl-4">{row.getValue("order_number")}</div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div>
            <div className="text-sm font-medium">{customer.full_name}</div>
            <div className="text-xs text-muted-foreground">{customer.phone_number}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "rider",
      header: "Rider",
      cell: ({ row }) => {
        const rider = row.original.rider;
        if (!rider) {
          return <div className="text-sm text-muted-foreground">Not assigned</div>;
        }
        return (
          <div>
            <div className="text-sm font-medium">{rider.full_name}</div>
            <div className="text-xs text-muted-foreground">{rider.phone_number}</div>
          </div>
        );
      },
    },
     {
       accessorKey: "route",
       header: "Route",
       cell: ({ row }) => {
         const order = row.original;
         return (
           <div className="min-w-0">
             <div className="text-sm font-medium break-words whitespace-normal">From: <span className="font-light">{order.pickup_address || "N/A"}</span></div>
             <div className="text-sm break-words whitespace-normal">To: <span className="font-light">{order.delivery_address || "N/A"}</span></div>
           </div>
         );
       },
     },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusConfig = {
          pending: { label: "Pending", className: "text-yellow-600 bg-yellow-50" },
          confirmed: { label: "Confirmed", className: "text-blue-600 bg-blue-50" },
          preparing: { label: "Preparing", className: "text-purple-600 bg-purple-50" },
          picked: { label: "Picked", className: "text-orange-600 bg-orange-50" },
          in_transit: { label: "In Transit", className: "text-blue-600 bg-blue-50" },
          delivered: { label: "Delivered", className: "text-green-600 bg-green-50" },
          completed: { label: "Completed", className: "text-green-600 bg-green-50" },
          cancelled: { label: "Cancelled", className: "text-red-600 bg-red-50" },
        }[status] || { label: status, className: "text-gray-600 bg-gray-50" };

        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
            {statusConfig.label}
          </div>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: () => <div className="pl-4">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_amount"));
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 0,
        }).format(amount);
        return <div className="font-medium pl-4">{formatted}</div>;
      },
      size: 120,
    },
    {
      accessorKey: "created_at",
      header: () => <div className="pl-4">Time</div>,
      cell: ({ row }) => {
        const time = new Date(row.getValue("created_at"));
        const formatted = time.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return <div className="text-sm pl-4">{formatted}</div>;
      },
      size: 140,
    },
  ];

export function OrdersTable({ data, onViewOrder, totalCount, currentPage, totalPages, pageSize = 10, onPageChange, onPageSizeChange, onSearch, onStatusFilter, statusFilter, isRefreshing }: OrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = createColumns(onViewOrder);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Debounced search handling
  const [searchValue, setSearchValue] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => {
      onSearch?.(searchValue);
    }, 300);
    return () => clearTimeout(t);
  }, [searchValue]);

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search orders..."
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onStatusFilter?.(undefined);
            } else {
              onStatusFilter?.(value);
            }
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {isRefreshing && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewOrder(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-muted-foreground text-sm">
          Showing {table.getFilteredRowModel().rows.length} of {totalCount} row(s)
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                onPageSizeChange(parseInt(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationFirst
                    onClick={() => onPageChange(1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    size="sm"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    size="sm"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    size="sm"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLast
                    onClick={() => onPageChange(totalPages)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    size="sm"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
