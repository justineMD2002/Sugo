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
import { ArrowUpDown, ChevronDown, Check, X, Eye, Loader2 } from "lucide-react"

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
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Application } from "@/lib/api/applications"

interface ApplicationsTableProps {
  data: Application[]
  onViewApplication: (application: Application) => void
  onApproveApplication: (application: Application) => void
  onRejectApplication: (application: Application) => void
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSearch?: (query: string) => void
  onStatusFilter?: (status: string | undefined) => void
  statusFilter?: string | undefined
  isRefreshing?: boolean
}

const createColumns = (
  onView: (application: Application) => void,
  onApprove: (application: Application) => void,
  onReject: (application: Application) => void
): ColumnDef<Application>[] => [
  {
    accessorKey: "applicant",
    header: () => <div className="pl-4">Applicant</div>,
    cell: ({ row }) => {
      const applicant = row.original
      return (
        <div className="flex items-center space-x-3 pl-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {applicant.applicant.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-sm">{applicant.applicant}</div>
            {/* <div className="text-xs text-muted-foreground">{applicant.id}</div> */}
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
      const applicant = row.original
      return (
        <div>
          <div className="text-sm font-medium">{applicant.contact}</div>
          <div className="text-xs text-muted-foreground">{applicant.email}</div>
        </div>
      )
    },
    size: 180,
  },
  // {
  //   accessorKey: "address",
  //   header: "Address",
  //   cell: ({ row }) => (
  //     <div className="text-sm text-muted-foreground max-w-xs truncate" title={row.getValue("address")}>
  //       {row.getValue("address")}
  //     </div>
  //   ),
  //   size: 200,
  // },
  {
    accessorKey: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => {
      const applicant = row.original
      return (
        <div>
          <div className="text-sm font-medium">{applicant.vehicle}</div>
          <div className="text-xs text-muted-foreground">{applicant.plateNumber}</div>
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "appliedDate",
    header: "Applied Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("appliedDate"))
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      return <div className="text-sm">{formatted}</div>
    },
    size: 120,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusConfig = {
        pending: { label: "Pending", className: "text-yellow-600 bg-yellow-50" },
        approved: { label: "Approved", className: "text-green-600 bg-green-50" },
        rejected: { label: "Rejected", className: "text-red-600 bg-red-50" },
      }[status] || { label: status, className: "text-gray-600 bg-gray-50" }

      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const application = row.original

      const handleApprove = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        onApprove(application)
      }

      const handleReject = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        onReject(application)
      }

      const isProcessed = application.status === "approved" || application.status === "rejected"
      
      return (
        <div className="flex items-center justify-center space-x-2">
          {!isProcessed && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleReject(e)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject application"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleApprove(e)}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Approve application"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    },
  },
]

export function ApplicationsTable({
  data,
  onViewApplication,
  onApproveApplication,
  onRejectApplication,
  totalCount,
  currentPage,
  totalPages,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onStatusFilter,
  statusFilter,
  isRefreshing
}: ApplicationsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = createColumns(onViewApplication, onApproveApplication, onRejectApplication)

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

  // Debounced search handling
  const [searchValue, setSearchValue] = React.useState("")
  React.useEffect(() => {
    const t = setTimeout(() => {
      onSearch?.(searchValue)
    }, 300)
    return () => clearTimeout(t)
  }, [searchValue])

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search applicants..."
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(value) => {
            if (value === "all") {
              // Clear both the table filter and parent state
              table.getColumn("status")?.setFilterValue(undefined)
              onStatusFilter?.(undefined)
            } else {
              // Set the table filter and parent state
              table.getColumn("status")?.setFilterValue(value)
              onStatusFilter?.(value)
            }
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewApplication(row.original)}
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
                onPageSizeChange(parseInt(value))
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
  )
}
