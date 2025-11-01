"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { Ticket } from "@/lib/api/tickets"

interface TicketDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket | null
}

export function TicketDetailModal({ isOpen, onClose, ticket }: TicketDetailModalProps) {
  if (!ticket) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusConfig = (status: string) => {
    const config = {
      open: { label: "Open", className: "text-red-600 bg-red-50" },
      in_progress: { label: "In Progress", className: "text-blue-600 bg-blue-50" },
      resolved: { label: "Resolved", className: "text-green-600 bg-green-50" },
      closed: { label: "Closed", className: "text-gray-600 bg-gray-50" },
    }[status] || { label: status, className: "text-gray-600 bg-gray-50" }
    return config
  }

  const raw = ticket.customer as any
  const customer = Array.isArray(raw) ? raw[0] : raw
  const statusConfig = getStatusConfig(ticket.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-xl font-semibold">Ticket {ticket.ticket_number}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(ticket.created_at)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Summary */}
          <Card className="border-0 bg-muted/70">
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                  {statusConfig.label}
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-4">Service Type</p>
              <div className="text-2xl font-bold text-foreground">{ticket.service_type}</div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Customer Info</p>
            <Card className="border-0 bg-muted/70">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-sm font-semibold">{customer?.full_name || "Unknown Customer"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact</p>
                  <p className="text-sm text-muted-foreground">{customer?.phone_number || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


