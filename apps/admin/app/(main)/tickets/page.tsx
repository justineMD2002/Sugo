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
import { ChatModal } from "@/components/tickets/chat-modal"
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

const data: Ticket[] = [
  {
    ticket_number: "TKT-001",
    customer: {
      name: "John Doe",
      contact: "09123456789",
    },
    service: "plumbing",
    status: "open",
    assigned_to: "Support Team A",
    created: "2024-01-15T10:30:00Z",
  },
  {
    ticket_number: "TKT-002",
    customer: {
      name: "Jane Smith",
      contact: "09123456789",
    },
    service: "electrician",
    status: "in_progress",
    assigned_to: "Mike Johnson",
    created: "2024-01-15T11:15:00Z",
  },
  {
    ticket_number: "TKT-003",
    customer: {
      name: "Bob Brown",
      contact: "09123456789",
    },
    service: "aircon",
    status: "resolved",
    assigned_to: "Sarah Wilson",
    created: "2024-01-15T12:00:00Z",
  },
  {
    ticket_number: "TKT-004",
    customer: {
      name: "Alice Davis",
      contact: "09123456789",
    },
    service: "plumbing",
    status: "closed",
    assigned_to: "Alex Chen",
    created: "2024-01-15T13:45:00Z",
  },
  {
    ticket_number: "TKT-005",
    customer: {
      name: "Charlie Wilson",
      contact: "09123456789",
    },
    service: "electrician",
    status: "open",
    assigned_to: "Tom Lee",
    created: "2024-01-15T14:20:00Z",
  },
]

export type Ticket = {
  ticket_number: string
  customer: {
    name: string
    contact: string
  }
  service: "plumbing" | "electrician" | "aircon"
  status: "open" | "in_progress" | "resolved" | "closed"
  assigned_to: string
  created: string
}

const createColumns = (onOpenChat: (ticketNumber: string, ticketTitle: string) => void): ColumnDef<Ticket>[] => [
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
      const customer = row.original
      return (
        <div>
          <div className="text-sm font-medium">{customer.customer.name}</div>
          <div className="text-xs text-gray-500">{customer.customer.contact}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => {
      const service = row.getValue("service") as string
      const serviceConfig = {
        plumbing: { label: "Plumbing", className: "text-blue-600 bg-blue-50" },
        electrician: { label: "Electrician", className: "text-yellow-600 bg-yellow-50" },
        aircon: { label: "Aircon", className: "text-cyan-600 bg-cyan-50" },
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
    accessorKey: "assigned_to",
    header: "Assigned To",
    cell: ({ row }) => (
      <div className="text-sm font-medium">{row.getValue("assigned_to")}</div>
    ),
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => {
      const time = new Date(row.getValue("created"))
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
        onOpenChat(ticket.ticket_number, ticket.service, ticket.status)
      }

      const handleView = () => {
        console.log("Viewing ticket:", ticket.ticket_number)
        // Add your view logic here
      }

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleChatClick}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Open chat"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View ticket details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function TicketsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [chatModal, setChatModal] = React.useState<{
    isOpen: boolean
    ticketNumber: string
    service: string
    customerName: string
    customerContact: string
    status: string
  }>({
    isOpen: false,
    ticketNumber: "",
    service: "",
    customerName: "",
    customerContact: "",
    status: "",
  })
  const [messages, setMessages] = React.useState([
    {
      id: "1",
      text: "Hello, I need help with my plumbing issue",
      timestamp: "10:30 AM",
      sender: "customer" as const,
      senderName: "John Doe",
    },
    {
      id: "2",
      text: "",
      timestamp: "10:31 AM",
      sender: "customer" as const,
      senderName: "John Doe",
      imageUrl: "https://4.img-dpreview.com/files/p/E~TS590x0~articles/3925134721/0266554465.jpeg",
    },
    {
      id: "3",
      text: "Hi! I've received your ticket. A plumber will be assigned to you shortly.",
      timestamp: "10:32 AM",
      sender: "admin" as const,
    },
    {
      id: "4",
      text: "Thank you! When can I expect the plumber to arrive?",
      timestamp: "10:35 AM",
      sender: "customer" as const,
      senderName: "John Doe",
    },
    {
      id: "4",
      text: "Thank you! When can I expect the plumber to arrive?",
      timestamp: "10:35 AM",
      sender: "customer" as const,
      senderName: "John Doe",
    },
    {
      id: "4",
      text: "Thank you! When can I expect the plumber to arrive?",
      timestamp: "10:35 AM",
      sender: "customer" as const,
      senderName: "John Doe",
    },
  ])

  const handleOpenChat = (ticketNumber: string, service: string, status: string) => {
    setChatModal({
      isOpen: true,
      ticketNumber,
      service,
      customerName: "John Doe",
      customerContact: "+63 945 678 9012",
      status,
    })
  }

  const handleCloseChat = () => {
    setChatModal({
      isOpen: false,
      ticketNumber: "",
      service: "",
      customerName: "",
      customerContact: "",
      status: "",
    })
  }

  const handleSendMessage = (message: string, imageUrl?: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      sender: "admin" as const,
      imageUrl,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleStatusChange = (newStatus: string) => {
    setChatModal((prev) => ({
      ...prev,
      status: newStatus,
    }))
    // Here you would typically update the ticket status in your backend
    console.log(`Status changed to: ${newStatus}`)
  }

  const columns = createColumns(handleOpenChat)

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
    <div className="w-full px-4 lg:px-6 py-4 md:py-6">
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Filter by customer name or ticket number..."
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={handleCloseChat}
        ticketNumber={chatModal.ticketNumber}
        service={chatModal.service}
        customerName={chatModal.customerName}
        customerContact={chatModal.customerContact}
        status={chatModal.status}
        onStatusChange={handleStatusChange}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}
