"use client"

import * as React from "react"
import { X, Check, User, Phone, Mail, MapPin, Car, Calendar } from "lucide-react"
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

interface Application {
  id: string
  applicant: string
  contact: string
  address: string
  vehicle: string
  plateNumber: string
  appliedDate: string
  status: "pending" | "approved" | "rejected"
  email: string
}

interface ApplicationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  onApprove: (application: Application) => void
  onReject: (application: Application) => void
}

export function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
}: ApplicationDetailModalProps) {
  if (!application) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      default:
        return status
    }
  }

  const isProcessed = application.status === "approved" || application.status === "rejected"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">{application.applicant}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{application.id}</p>
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
              <AvatarImage src="" alt={application.applicant} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                {application.applicant.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <Badge variant={getStatusVariant(application.status)} className="w-fit mx-auto">
            {getStatusLabel(application.status)}
          </Badge>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-semibold">{application.contact}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-sm font-semibold">{application.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plate Number</p>
                    <p className="text-sm font-semibold">{application.plateNumber}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold">{application.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle Type</p>
                    <p className="text-sm font-semibold">{application.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                    <p className="text-sm font-semibold">{formatDate(application.appliedDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {!isProcessed && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onReject(application)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => onApprove(application)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
