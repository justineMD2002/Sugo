"use client"

import * as React from "react"
import { X, MapPin, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import type { Order, User, Delivery } from "@/lib/types/database"

interface OrderWithDetails extends Order {
  customer: User
  rider?: User
  delivery?: Delivery
}

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderWithDetails | null
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
}: OrderDetailModalProps) {
  if (!order) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "preparing":
        return "default"
      case "picked":
        return "default"
      case "in_transit":
        return "default"
      case "delivered":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "picked":
        return "Picked"
      case "in_transit":
        return "In Transit"
      case "delivered":
        return "Delivered"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-xl font-semibold">Order {order.order_number}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="border-0 bg-muted/70">
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                <Badge variant={getStatusVariant(order.status)} className="text-sm">
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-4">Amount</p>
              <div className="text-2xl font-bold text-foreground">{formatAmount(order.total_amount)}</div>
            </CardContent>
          </Card>

          {/* Customer & Rider Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{order.customer.full_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.phone_number}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Rider</h3>
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  {order.rider ? (
                    <>
                      <p className="text-sm font-semibold">{order.rider.full_name}</p>
                      <p className="text-xs text-muted-foreground">{order.rider.phone_number}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Route</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pickup</p>
                  <p className="text-sm font-semibold">{order.pickup_address || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Drop-off</p>
                  <p className="text-sm font-semibold">{order.delivery_address || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
