"use client";

import {
  IconBike,
  IconClipboardList,
  IconDashboard,
  IconLogout,
  IconShoppingCart,
  IconTicket,
  IconUser
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Riders",
      url: "/riders",
      icon: IconBike,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUser,
    },
    {
      title: "Applications",
      url: "/applications",
      icon: IconClipboardList,
    },
    {
      title: "Service Tickets",
      url: "/tickets",
      icon: IconTicket,
    },
  ],
  navSecondary: [
    {
      title: "Logout",
      url: "#",
      icon: IconLogout,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <a href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sugo" width={56} height={56} />
          <span className="text-[22px] font-semibold">Sugo Admin</span>
        </a>
      </SidebarHeader>
      <SidebarContent className="-mt-3">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary />
      </SidebarFooter>
    </Sidebar>
  );
}
