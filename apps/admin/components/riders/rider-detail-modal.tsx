"use client"

import * as React from "react"
import { X, Star, Phone, Mail, Car, Calendar, ToggleLeft, ToggleRight } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

interface Rider {
  id: string
  rider: string
  contact: string
  email: string
  vehicle: string
  status: "online" | "offline" | "busy"
  rating: number
  ratingCount: number
  earnings: number
  plateNumber: string
}

interface RiderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  rider: Rider | null
  onToggleStatus: (rider: Rider) => void
}

export function RiderDetailModal({
  isOpen,
  onClose,
  rider,
  onToggleStatus,
}: RiderDetailModalProps) {
  if (!rider) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "online":
        return "default"
      case "busy":
        return "secondary"
      case "offline":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online":
        return "ONLINE"
      case "busy":
        return "BUSY"
      case "offline":
        return "OFFLINE"
      default:
        return status.toUpperCase()
    }
  }

  const formatEarnings = (earnings: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(earnings)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">{rider.rider}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{rider.id}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" alt={rider.rider} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                {rider.rider.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <Badge variant={getStatusVariant(rider.status)} className="w-fit mx-auto">
            {getStatusLabel(rider.status)}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="text-center p-4">
                <div className="text-2xl font-bold text-foreground">{rider.ratingCount}</div>
                <div className="text-sm text-muted-foreground">Deliveries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-4">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-yellow-600">
                  <Star className="h-6 w-6 fill-current" />
                  <span>{rider.rating}</span>
                </div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">{formatEarnings(rider.earnings)}</div>
                <div className="text-sm text-muted-foreground">Earnings</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-semibold">{rider.contact}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">{rider.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                  <p className="text-sm font-semibold">{rider.vehicle}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined Date</p>
                  <p className="text-sm font-semibold">2024-01-15</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Status</p>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      rider.status === 'online' ? 'bg-green-500' : 
                      rider.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">{getStatusLabel(rider.status)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={() => onToggleStatus(rider)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {rider.status === 'offline' ? (
                <>
                  <ToggleRight className="h-4 w-4 mr-2" />
                  Toggle Status
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 mr-2" />
                  Toggle Status
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
