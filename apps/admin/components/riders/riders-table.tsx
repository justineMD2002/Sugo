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
import type { Rider } from "@/lib/api/riders"

interface RidersTableProps {
  data: Rider[]
  onViewRider: (rider: Rider) => void
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize?: number
}

const createColumns = (
  onView: (rider: Rider) => void
): ColumnDef<Rider>[] => [
  {
    accessorKey: "rider",
    header: "Rider",
    cell: ({ row }) => {
      const rider = row.original
      return (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {rider.rider.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              rider.status === 'online' ? 'bg-green-500' : 
              rider.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <div className="font-medium text-sm">{rider.rider}</div>
            <div className="text-xs text-muted-foreground">{rider.id}</div>
          </div>
        </div>
      )
    },
    size: 200,
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const rider = row.original
      return (
        <div>
          <div className="text-sm font-medium">{rider.contact}</div>
          <div className="text-xs text-muted-foreground">{rider.email}</div>
        </div>
      )
    },
    size: 180,
  },
  {
    accessorKey: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => {
      const rider = row.original
      return (
        <div>
          <div className="text-sm font-medium">{rider.vehicle}</div>
          <div className="text-xs text-muted-foreground">{rider.plateNumber}</div>
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusConfig = {
        online: { label: "Online", className: "text-green-600 bg-green-50" },
        busy: { label: "Busy", className: "text-yellow-600 bg-yellow-50" },
        offline: { label: "Offline", className: "text-gray-600 bg-gray-50" },
      }[status] || { label: status, className: "text-gray-600 bg-gray-50" }

      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rider = row.original
      return (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-medium">{rider.rating}</span>
          </div>
          <div className="text-xs text-muted-foreground">({rider.ratingCount})</div>
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "earnings",
    header: () => <div className="text-right">Earnings</div>,
    cell: ({ row }) => {
      const earnings = row.getValue("earnings") as number
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
      }).format(earnings)
      return <div className="text-right font-medium text-green-600">{formatted}</div>
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const rider = row.original

      const handleView = () => {
        onView(rider)
      }

      return (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View rider details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export function RidersTable({ 
    data, 
    onViewRider, 
    totalCount, 
    currentPage, 
    totalPages, 
    pageSize = 10 
}: RidersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = createColumns(onViewRider)

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
          placeholder="Filter by rider name..."
          value={(table.getColumn("rider")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("rider")?.setFilterValue(event.target.value)
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
                window.location.href = `/riders?page=1&limit=${value}`
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
                href={`/riders?page=${currentPage - 1}&limit=${pageSize}`}
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
                    href={`/riders?page=${pageNumber}&limit=${pageSize}`}
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
                href={`/riders?page=${currentPage + 1}&limit=${pageSize}`}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
