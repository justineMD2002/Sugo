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
import { ArrowUpDown, ChevronDown, Eye, MessageCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
import { updateTicketStatus } from "@/lib/api/tickets"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { TicketDetailModal } from "@/components/tickets/ticket-detail-modal"
import type { Ticket } from "@/lib/api/tickets"

interface TicketsProps {
  initialTickets: Ticket[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSearch?: (query: string) => void
  onStatusFilter?: (status: string | undefined) => void
  isRefreshing?: boolean
}

const createColumns = (onOpenChat: (ticketId: string, ticketNumber: string, service: string, status: string) => void): ColumnDef<Ticket>[] => [
  {
    accessorKey: "ticket_number",
    header: () => <div className="pl-4">Ticket</div>,
    cell: ({ row }) => (
      <div className="font-mono text-sm pl-4">{row.getValue("ticket_number")}</div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const raw = row.original.customer as any
      const customer = Array.isArray(raw) ? raw[0] : raw
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

      const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onOpenChat(ticket.id, ticket.ticket_number, ticket.service_type, ticket.status)
      }

      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleChatClick}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Open chat"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
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
  onPageSizeChange,
  onSearch,
  onStatusFilter,
  isRefreshing
}: TicketsProps) {
  const { user, isLoading: userLoading } = useCurrentUser()
  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets)
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

  const [detailModal, setDetailModal] = React.useState<{ isOpen: boolean; ticket: Ticket | null }>({
    isOpen: false,
    ticket: null,
  })

  const handleOpenChat = (ticketId: string, ticketNumber: string, service: string, status: string) => {
    // Find the ticket to get customer data
    const ticket = tickets.find(t => t.id === ticketId)
    const raw = ticket?.customer as any
    const customer = Array.isArray(raw) ? raw?.[0] : raw
    
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

  // Row click opens chat modal for that ticket
  const openChatForTicket = (ticket: Ticket) => {
    setChatModal({
      isOpen: true,
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      service: ticket.service_type,
      customerName: ticket.customer?.[0]?.full_name || "Unknown Customer",
      customerContact: ticket.customer?.[0]?.phone_number || "N/A",
      status: ticket.status,
    })
  }

  const openDetailsForTicket = (ticket: Ticket) => {
    setDetailModal({ isOpen: true, ticket })
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
      // Prevent reopening a resolved ticket
      const currentTicket = tickets.find(t => t.id === chatModal.ticketId)
      if (currentTicket?.status === "resolved" && newStatus !== "resolved") {
        return
      }

      // Allow only the three valid statuses
      const allowedStatuses = new Set(["open", "in_progress", "resolved"])
      if (!allowedStatuses.has(newStatus)) {
        return
      }

      await updateTicketStatus(chatModal.ticketId, newStatus as any)
      setChatModal((prev) => ({
        ...prev,
        status: newStatus,
      }))
      // Reflect status change in table rows
      setTickets((prev) =>
        prev.map((t) => (t.id === chatModal.ticketId ? { ...t, status: newStatus } as Ticket : t))
      )
      // You could add a toast notification here for success
    } catch (error) {
      console.error("Failed to update ticket status:", error)
      // You could add a toast notification here for error
    }
  }

  const columns = createColumns(handleOpenChat)

  const table = useReactTable({
    data: tickets,
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
    <>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search tickets..."
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={table.getColumn("status")?.getFilterValue() as string || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              table.getColumn("status")?.setFilterValue(undefined)
              onStatusFilter?.(undefined)
            } else {
              table.getColumn("status")?.setFilterValue(value)
              onStatusFilter?.(value)
            }
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        {isRefreshing && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
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
                  onClick={() => openDetailsForTicket(row.original)}
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

      <TicketDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, ticket: null })}
        ticket={detailModal.ticket}
      />
    </>
  )
}