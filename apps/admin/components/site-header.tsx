"use client"

import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/applications": "Applications", 
  "/riders": "Riders",
  "/orders": "Orders",
  "/tickets": "Service Tickets",
  "/customers": "Customers",
}

const routeDescriptions: Record<string, string> = {
  "/dashboard": "Overview and analytics for your delivery platform",
  "/applications": "Review and approve new rider applications",
  "/riders": "Manage active riders and their performance",
  "/orders": "Monitor and track all delivery orders",
  "/tickets": "Manage service requests (plumbing, electrician, aircon repair)",
  "/customers": "Manage customer accounts and relationships",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = routeTitles[pathname] || "Dashboard"
  const description = routeDescriptions[pathname] || "Overview and analytics for your delivery platform"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-col">
          <h1 className="text-lg font-medium">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </header>
  )
}
