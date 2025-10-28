"use client"

import * as React from "react"
import { ApplicationsTable } from "./applications-table"
import { ApplicationDetailModal } from "./application-detail-modal"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { Check, X } from "lucide-react"
import type { Application } from "@/lib/api/applications"

interface ApplicationsProps {
  initialApplications: Application[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export function Applications({ 
  initialApplications, 
  totalCount, 
  currentPage, 
  totalPages,
  pageSize
}: ApplicationsProps) {
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false)
  const [confirmationAction, setConfirmationAction] = React.useState<{
    type: 'approve' | 'reject'
    application: Application | null
  }>({ type: 'approve', application: null })
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const handleApproveApplication = (application: Application) => {
    setConfirmationAction({ type: 'approve', application })
    setIsConfirmationModalOpen(true)
  }

  const handleRejectApplication = (application: Application) => {
    setConfirmationAction({ type: 'reject', application })
    setIsConfirmationModalOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!confirmationAction.application) return

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`${confirmationAction.type}ing application:`, confirmationAction.application.id)
      // Add your actual API call here
      
      setIsConfirmationModalOpen(false)
      setConfirmationAction({ type: 'approve', application: null })
    } catch (error) {
      console.error('Error processing application:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedApplication(null)
  }

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false)
    setConfirmationAction({ type: 'approve', application: null })
  }

  return (
    <>
      <ApplicationsTable 
        data={initialApplications} 
        onViewApplication={handleViewApplication}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
      />
      
      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        application={selectedApplication}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmAction}
        title={`${confirmationAction.type === 'approve' ? 'Approve' : 'Reject'} Application?`}
        description={
          confirmationAction.type === 'approve'
            ? "Are you sure you want to approve this rider application? This will grant them access to the platform."
            : "Are you sure you want to reject this application? This action cannot be undone."
        }
        confirmText={confirmationAction.type === 'approve' ? 'Approve' : 'Reject'}
        confirmVariant={confirmationAction.type === 'approve' ? 'default' : 'destructive'}
        confirmIcon={confirmationAction.type === 'approve' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        isLoading={isProcessing}
      />
    </>
  )
}
