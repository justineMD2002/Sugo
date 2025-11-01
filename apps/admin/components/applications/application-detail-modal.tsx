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
import type { Application } from "@/lib/api/applications"

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

  const getStatusConfig = (status: string) => {
    const config = {
      pending: { label: "Pending", className: "text-yellow-600 bg-yellow-50" },
      approved: { label: "Approved", className: "text-green-600 bg-green-50" },
      rejected: { label: "Rejected", className: "text-red-600 bg-red-50" },
    }[status] || { label: status, className: "text-gray-600 bg-gray-50" }
    return config
  }

  const isProcessed = application.status === "approved" || application.status === "rejected"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">{application.applicant}</DialogTitle>
            {/* <p className="text-sm text-muted-foreground mt-1">{application.id}</p> */}
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

        <div className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" alt={application.applicant} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                {application.applicant.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(application.status).className} w-fit mx-auto`}>
            {getStatusConfig(application.status).label}
          </div>
        </div>

        <div className="space-y-6">
            <Card className="border-0 bg-muted/70">
              <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-semibold break-words">{application.contact}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Vehicle Type</p>
                    <p className="text-sm font-semibold break-words">{application.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                    <p className="text-sm font-semibold break-words">{formatDate(application.appliedDate)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold break-all">{application.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Plate Number</p>
                    <p className="text-sm font-semibold break-words">{application.plateNumber}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  {/* <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                    <p className="text-sm font-semibold">{formatDate(application.appliedDate)}</p>
                  </div> */}
                </div>
              </div>
            </div>
              </CardContent>
            </Card>

            {!isProcessed && (
              <div className="flex justify-end space-x-3">
                 <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
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
