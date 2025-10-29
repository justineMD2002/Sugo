"use client"

import * as React from "react"
import { X, User, Phone, Mail, ShoppingCart, Wrench } from "lucide-react"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import type { Customer } from "@/lib/api/customers"

interface CustomerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
}: CustomerDetailModalProps) {
  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">{customer.customer}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{customer.id}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Avatar and Basic Info */}
          <div className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={customer.customer} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                  {customer.customer.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            <Card className="border-0 bg-muted/70">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">{customer.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Activity Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 bg-muted/70">
                <CardContent className="text-center p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-foreground">{customer.orders_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-muted/70">
                <CardContent className="text-center p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-foreground">{customer.services_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Services Used</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Button */}
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
