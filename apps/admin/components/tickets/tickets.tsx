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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Copy, Eye, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
import { updateTicketStatus } from "@/lib/api/tickets"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { ChatModal } from "@/components/tickets/chat-modal"
import type { Ticket } from "@/lib/api/tickets"

interface TicketsProps {
  initialTickets: Ticket[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const createColumns = (onOpenChat: (ticketId: string, ticketNumber: string, service: string, status: string) => void): ColumnDef<Ticket>[] => [
  {
    accessorKey: "ticket_number",
    header: "Ticket",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("ticket_number")}</div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer?.[0]
      return (
        <div>
          <div className="text-sm font-medium">{customer?.full_name || "Unknown Customer"}</div>
          <div className="text-xs text-gray-500">{customer?.phone_number || "N/A"}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "service_type",
    header: "Service",
    cell: ({ row }) => {
      const service = row.getValue("service_type") as string
      const serviceConfig = {
        PLUMBING: { label: "Plumbing", className: "text-blue-600 bg-blue-50" },
        ELECTRICAL: { label: "Electrical", className: "text-yellow-600 bg-yellow-50" },
        AIRCON: { label: "Aircon", className: "text-cyan-600 bg-cyan-50" },
        CARPENTRY: { label: "Carpentry", className: "text-green-600 bg-green-50" },
        DELIVERY: { label: "Delivery", className: "text-purple-600 bg-purple-50" },
        OTHER: { label: "Other", className: "text-gray-600 bg-gray-50" },
      }[service] || { label: service, className: "text-gray-600 bg-gray-50" }

      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${serviceConfig.className}`}>
          {serviceConfig.label}
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
        open: { label: "Open", className: "text-red-600 bg-red-50" },
        in_progress: { label: "In Progress", className: "text-blue-600 bg-blue-50" },
        resolved: { label: "Resolved", className: "text-green-600 bg-green-50" },
        closed: { label: "Closed", className: "text-gray-600 bg-gray-50" },
      }[status] || { label: status, className: "text-gray-600 bg-gray-50" }

      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const time = new Date(row.getValue("created_at"))
      const formatted = time.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      return <div className="text-sm">{formatted}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const ticket = row.original

      const handleChatClick = () => {
        onOpenChat(ticket.id, ticket.ticket_number, ticket.service_type, ticket.status)
      }

      const handleCopy = () => {
        navigator.clipboard.writeText(ticket.ticket_number)
        // You could add a toast notification here
      }

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ticket number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChatClick}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Open chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function Tickets({ 
  initialTickets, 
  totalCount, 
  currentPage, 
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}: TicketsProps) {
  const { user, isLoading: userLoading } = useCurrentUser()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [chatModal, setChatModal] = React.useState<{
    isOpen: boolean
    ticketId: string
    ticketNumber: string
    service: string
    customerName: string
    customerContact: string
    status: string
  }>({
    isOpen: false,
    ticketId: "",
    ticketNumber: "",
    service: "",
    customerName: "",
    customerContact: "",
    status: "",
  })

  const handleOpenChat = (ticketId: string, ticketNumber: string, service: string, status: string) => {
    // Find the ticket to get customer data
    const ticket = initialTickets.find(t => t.id === ticketId)
    const customer = ticket?.customer?.[0]
    
    setChatModal({
      isOpen: true,
      ticketId,
      ticketNumber,
      service,
      customerName: customer?.full_name || "Unknown Customer",
      customerContact: customer?.phone_number || "N/A",
      status,
    })
  }

  const handleViewTicket = (ticket: Ticket) => {
    console.log("Viewing ticket:", ticket.ticket_number)
    // Add your view logic here - could open a modal or navigate to details page
  }

  const handleCloseChat = () => {
    setChatModal({
      isOpen: false,
      ticketId: "",
      ticketNumber: "",
      service: "",
      customerName: "",
      customerContact: "",
      status: "",
    })
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicketStatus(chatModal.ticketId, newStatus as any)
      setChatModal((prev) => ({
        ...prev,
        status: newStatus,
      }))
      // You could add a toast notification here for success
    } catch (error) {
      console.error("Failed to update ticket status:", error)
      // You could add a toast notification here for error
    }
  }

  const columns = createColumns(handleOpenChat)

  const table = useReactTable({
    data: initialTickets,
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
    <>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Filter tickets..."
          value={(table.getColumn("ticket_number")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ticket_number")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                  onClick={() => handleViewTicket(row.original)}
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
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
      
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={handleCloseChat}
        ticketId={chatModal.ticketId}
        ticketNumber={chatModal.ticketNumber}
        service={chatModal.service}
        customerName={chatModal.customerName}
        customerContact={chatModal.customerContact}
        status={chatModal.status}
        onStatusChange={handleStatusChange}
        currentUserId={user?.id || ""}
      />
    </>
  )
}