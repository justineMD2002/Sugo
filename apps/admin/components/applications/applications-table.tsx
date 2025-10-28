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
import { ArrowUpDown, ChevronDown, Check, X, Eye } from "lucide-react"

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
}

const createColumns = (
  onView: (application: Application) => void,
  onApprove: (application: Application) => void,
  onReject: (application: Application) => void
): ColumnDef<Application>[] => [
  {
    accessorKey: "applicant",
    header: "Applicant",
    cell: ({ row }) => {
      const applicant = row.original
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {applicant.applicant.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-sm">{applicant.applicant}</div>
            <div className="text-xs text-muted-foreground">{applicant.id}</div>
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
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-xs truncate" title={row.getValue("address")}>
        {row.getValue("address")}
      </div>
    ),
    size: 200,
  },
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
        under_review: { label: "Under Review", className: "text-blue-600 bg-blue-50" },
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

      const handleApprove = () => {
        onApprove(application)
      }

      const handleReject = () => {
        onReject(application)
      }

      const handleView = () => {
        onView(application)
      }

      const isProcessed = application.status === "approved" || application.status === "rejected"
      
      return (
        <div className="flex items-center justify-center space-x-2">
          {!isProcessed && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprove}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Approve application"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReject}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject application"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View application details"
          >
            <Eye className="h-4 w-4" />
          </Button>
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
    pageSize = 10 
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

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Filter by applicant name..."
          value={(table.getColumn("applicant")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("applicant")?.setFilterValue(event.target.value)
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
                window.location.href = `/applications?page=1&limit=${value}`
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
                href={`/applications?page=${currentPage - 1}&limit=${pageSize}`}
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
                    href={`/applications?page=${pageNumber}&limit=${pageSize}`}
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
                href={`/applications?page=${currentPage + 1}&limit=${pageSize}`}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
