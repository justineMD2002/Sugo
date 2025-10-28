"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Order, User, Delivery } from "@/lib/types/database"

interface OrderWithDetails extends Order {
  customer: User
  rider?: User
  delivery?: Delivery
}

interface OrdersTableProps {
  data: OrderWithDetails[]
  onViewOrder: (order: OrderWithDetails) => void
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize?: number
}

const createColumns = (
  onView: (order: OrderWithDetails) => void
): ColumnDef<OrderWithDetails>[] => [
  {
    accessorKey: "order_number",
    header: "Order Number",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("order_number")}</div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer
      return (
        <div>
          <div className="text-sm font-medium">{customer.full_name}</div>
          <div className="text-xs text-muted-foreground">{customer.phone_number}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "rider",
    header: "Rider",
    cell: ({ row }) => {
      const rider = row.original.rider
      if (!rider) {
        return <div className="text-sm text-muted-foreground">Not assigned</div>
      }
      return (
        <div>
          <div className="text-sm font-medium">{rider.full_name}</div>
          <div className="text-xs text-muted-foreground">{rider.phone_number}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "route",
    header: "Route",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div className="text-sm font-medium">From: {order.pickup_address || "N/A"}</div>
          <div className="text-sm">To: {order.delivery_address || "N/A"}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusConfig = {
        pending: { label: "Pending", className: "text-yellow-600 bg-yellow-50" },
        confirmed: { label: "Confirmed", className: "text-blue-600 bg-blue-50" },
        preparing: { label: "Preparing", className: "text-purple-600 bg-purple-50" },
        picked: { label: "Picked", className: "text-orange-600 bg-orange-50" },
        in_transit: { label: "In Transit", className: "text-blue-600 bg-blue-50" },
        delivered: { label: "Delivered", className: "text-green-600 bg-green-50" },
        completed: { label: "Completed", className: "text-green-600 bg-green-50" },
        cancelled: { label: "Cancelled", className: "text-red-600 bg-red-50" },
      }[status] || { label: status, className: "text-gray-600 bg-gray-50" }

      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </div>
      )
    },
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right pr-4">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
      }).format(amount)
      return <div className="text-right font-medium pr-4">{formatted}</div>
    },
    size: 120,
  },
  {
    accessorKey: "created_at",
    header: () => <div className="pl-4">Time</div>,
    cell: ({ row }) => {
      const time = new Date(row.getValue("created_at"))
      const formatted = time.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      return <div className="text-sm pl-4">{formatted}</div>
    },
    size: 140,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original

      const handleView = () => {
        onView(order)
      }

      return (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View order details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export function OrdersTable({ data, onViewOrder, totalCount, currentPage, totalPages, pageSize = 10 }: OrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = createColumns(onViewOrder)

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
  })

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Filter by customer or order ID..."
          value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customer")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
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
                  )
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
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-4">
          <div className="text-muted-foreground text-sm">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                window.location.href = `/orders?page=1&limit=${value}`
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
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={`/orders?page=${currentPage - 1}&limit=${pageSize}`}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {/* Generate page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber
              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={`/orders?page=${pageNumber}&limit=${pageSize}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                href={`/orders?page=${currentPage + 1}&limit=${pageSize}`}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
