"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconPackage, IconUser, IconTools, IconFilter, IconCheck, IconX, IconClock, IconMapPin } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RecentOrder, RecentApplication, RecentTicket } from "@/lib/api/dashboard";
import { OrderDetailModal } from "@/components/orders/order-detail-modal";
import { TicketDetailModal } from "@/components/tickets/ticket-detail-modal";
import { ApplicationDetailModal } from "@/components/applications/application-detail-modal";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { updateApplicationStatus } from "@/lib/api/applications";
import type { Order, Delivery } from "@/lib/types/database";
import type { User } from "@/lib/types/database";
import type { Ticket } from "@/lib/api/tickets";
import type { Application } from "@/lib/api/applications";

interface RecentActivityProps {
  recentOrders: RecentOrder[];
  recentApplications: RecentApplication[];
  recentTickets: RecentTicket[];
  onApplicationsUpdate?: (applications: RecentApplication[]) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
    case "Assigned":
    case "in_progress":
    case "assigned":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Delivered":
    case "Completed":
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Pending":
    case "New":
    case "pending":
    case "new":
    case "open":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Picked Up":
    case "picked_up":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

interface OrderWithDetails extends Order {
  customer: User;
  rider?: User;
  delivery?: Delivery;
}

export function RecentActivity({ recentOrders, recentApplications, recentTickets, onApplicationsUpdate }: RecentActivityProps) {
  const router = useRouter();

  // Local state to update applications list immediately
  const [localApplications, setLocalApplications] = React.useState(recentApplications);

  React.useEffect(() => {
    setLocalApplications(recentApplications);
  }, [recentApplications]);

  // Order modal state
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithDetails | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);

  // Ticket modal state
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);

  // Application modal state
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = React.useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
  const [confirmationAction, setConfirmationAction] = React.useState<{
    type: 'approve' | 'reject';
    application: Application | null;
  }>({ type: 'approve', application: null });
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Handle viewing order - use data from dashboard API
  const handleViewOrder = (orderId: string) => {
    const recentOrder = recentOrders.find(o => o.id === orderId);
    if (!recentOrder?.orderData) {
      console.error('Order data not found');
      return;
    }

    const orderData = recentOrder.orderData;
    const orderWithDetails: OrderWithDetails = {
      ...orderData,
      customer: orderData.customer,
      rider: orderData.delivery?.rider,
      delivery: orderData.delivery,
    };

    setSelectedOrder(orderWithDetails);
    setIsOrderModalOpen(true);
  };

  // Handle viewing ticket - use data from dashboard API
  const handleViewTicket = (ticketId: string) => {
    const recentTicket = recentTickets.find(t => t.id === ticketId);
    if (!recentTicket?.ticketData) {
      console.error('Ticket data not found');
      return;
    }

    setSelectedTicket(recentTicket.ticketData as Ticket);
    setIsTicketModalOpen(true);
  };

  // Handle viewing application - use data from dashboard API
  const handleViewApplication = (applicationId: string) => {
    const recentApp = localApplications.find(a => a.id === applicationId);
    if (!recentApp?.applicationData) {
      console.error('Application data not found');
      return;
    }

    setSelectedApplication(recentApp.applicationData as Application);
    setIsApplicationModalOpen(true);
  };

  // Handle approve/reject application
  const handleApproveApplication = (application: Application) => {
    setIsApplicationModalOpen(false);
    setConfirmationAction({ type: 'approve', application });
    setIsConfirmationModalOpen(true);
  };

  const handleRejectApplication = (application: Application) => {
    setIsApplicationModalOpen(false);
    setConfirmationAction({ type: 'reject', application });
    setIsConfirmationModalOpen(true);
  };

  // Helper to get application data for approve/reject buttons
  const getApplicationFromId = (applicationId: string): Application | null => {
    const recentApp = localApplications.find(a => a.id === applicationId);
    if (!recentApp?.applicationData) return null;
    return recentApp.applicationData as Application;
  };

  const handleConfirmAction = async () => {
    if (!confirmationAction.application) return;

    setIsProcessing(true);
    try {
      const status = confirmationAction.type === 'approve' ? 'approved' : 'rejected';
      await updateApplicationStatus(confirmationAction.application.id, status);

      // Remove the application from local state immediately
      const updatedApplications = localApplications.filter(app => app.id !== confirmationAction.application!.id);
      setLocalApplications(updatedApplications);

      // Update parent component's applications state
      onApplicationsUpdate?.(updatedApplications);

      // Show success toast
      toast.success(
        `Application ${confirmationAction.type === 'approve' ? 'approved' : 'rejected'} successfully`,
        {
          description: `${confirmationAction.application.applicant}'s application has been ${confirmationAction.type === 'approve' ? 'approved' : 'rejected'}.`,
        }
      );

      setIsConfirmationModalOpen(false);
      setConfirmationAction({ type: 'approve', application: null });
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error(
        `Failed to ${confirmationAction.type === 'approve' ? 'approve' : 'reject'} application`,
        {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 items-stretch">
      {/* Recent Orders */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconPackage className="size-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Delivery orders and their status</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => router.push("/orders")}>
              See all
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[200px] h-full">
          {recentOrders.length > 0 ? (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell className="min-w-0">
                      <div className="min-w-0">
                        <div className="font-medium break-words whitespace-normal">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground break-words whitespace-normal">{order.customer_address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const statusConfig = {
                          pending: { label: "Pending", className: "text-yellow-600 bg-yellow-50" },
                          confirmed: { label: "Confirmed", className: "text-blue-600 bg-blue-50" },
                          preparing: { label: "Preparing", className: "text-purple-600 bg-purple-50" },
                          picked: { label: "Picked", className: "text-orange-600 bg-orange-50" },
                          in_transit: { label: "In Transit", className: "text-blue-600 bg-blue-50" },
                          delivered: { label: "Delivered", className: "text-green-600 bg-green-50" },
                          completed: { label: "Completed", className: "text-green-600 bg-green-50" },
                          cancelled: { label: "Cancelled", className: "text-red-600 bg-red-50" },
                        }[order.status] || { label: order.status, className: "text-gray-600 bg-gray-50" };

                        return (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                            {statusConfig.label}
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <IconPackage className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No recent orders</p>
              <p className="text-xs text-muted-foreground mt-1">Orders will appear here when they are created</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Applications */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-5" />
                Pending Applications
              </CardTitle>
              <CardDescription>Rider applications awaiting review</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => router.push("/applications")}>
              Review All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[200px] h-full">
          {localApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewApplication(app.id)}
                  >
                    <TableCell className="font-medium">
                      {app.applicant_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{app.phone_number}</div>
                        <div className="text-sm text-muted-foreground">{app.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const statusConfig = {
                          pending: { label: "Pending", className: "text-yellow-600 bg-yellow-50" },
                          approved: { label: "Approved", className: "text-green-600 bg-green-50" },
                          rejected: { label: "Rejected", className: "text-red-600 bg-red-50" },
                        }[app.status] || { label: app.status, className: "text-gray-600 bg-gray-50" };

                        return (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                            {statusConfig.label}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const appData = getApplicationFromId(app.id);
                            if (appData) {
                              handleRejectApplication(appData);
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Reject application"
                        >
                          <IconX className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const appData = getApplicationFromId(app.id);
                            if (appData) {
                              handleApproveApplication(appData);
                            }
                          }}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Approve application"
                        >
                          <IconCheck className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <IconUser className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No pending applications</p>
              <p className="text-xs text-muted-foreground mt-1">Applications will appear here when riders apply</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Tickets */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconTools className="size-5" />
                Recent Services
              </CardTitle>
              <CardDescription>Plumbing, electrician, and aircon services</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => router.push("/tickets")}>
              Manage All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[200px] h-full">
          {recentTickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{ticket.customer_phone || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.service_type}</TableCell>
                    <TableCell>
                      {(() => {
                        const statusConfig = {
                          open: { label: "Open", className: "text-red-600 bg-red-50" },
                          in_progress: { label: "In Progress", className: "text-blue-600 bg-blue-50" },
                          resolved: { label: "Resolved", className: "text-green-600 bg-green-50" },
                          closed: { label: "Closed", className: "text-gray-600 bg-gray-50" },
                        }[ticket.status] || { label: ticket.status, className: "text-gray-600 bg-gray-50" };

                        return (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                            {statusConfig.label}
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <IconTools className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No recent service tickets</p>
              <p className="text-xs text-muted-foreground mt-1">Service tickets will appear here when they are created</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <OrderDetailModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <TicketDetailModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />

      <ApplicationDetailModal
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
          setConfirmationAction({ type: 'approve', application: null });
        }}
        onConfirm={handleConfirmAction}
        title={`${confirmationAction.type === 'approve' ? 'Approve' : 'Reject'} Application?`}
        description={
          confirmationAction.type === 'approve'
            ? "Are you sure you want to approve this rider application? This will grant them access to the platform."
            : "Are you sure you want to reject this application? This action cannot be undone."
        }
        confirmText={confirmationAction.type === 'approve' ? 'Approve' : 'Reject'}
        confirmVariant={confirmationAction.type === 'approve' ? 'default' : 'destructive'}
        confirmIcon={confirmationAction.type === 'approve' ? <IconCheck className="h-4 w-4" /> : <IconX className="h-4 w-4" />}
        isLoading={isProcessing}
      />
    </div>
  );
}
