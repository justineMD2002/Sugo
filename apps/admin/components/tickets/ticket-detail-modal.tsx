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
import { Badge } from "@/components/ui/badge"
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
    switch (status) {
      case "open":
        return { label: "Open", variant: "destructive" as const }
      case "in_progress":
        return { label: "In Progress", variant: "default" as const }
      case "resolved":
        return { label: "Resolved", variant: "default" as const }
      case "closed":
        return { label: "Closed", variant: "secondary" as const }
      default:
        return { label: status, variant: "secondary" as const }
    }
  }

  const customer = ticket.customer?.[0]
  const status = getStatusConfig(ticket.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">Ticket {ticket.ticket_number}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(ticket.created_at)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-5">
          <Card className="border bg-muted/50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Service</p>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="text-xl font-semibold tracking-tight">{ticket.service_type}</div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Customer</p>
            <Card className="border bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-semibold">{customer?.full_name || "Unknown Customer"}</div>
                <div className="text-xs text-muted-foreground">{customer?.phone_number || "N/A"}</div>
              </CardContent>
            </Card>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  )
}


