"use client";

import * as React from "react";
import { IconLogout, type Icon } from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NavSecondary() {

  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (

    <SidebarMenu className="mt-auto">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <button  onClick={logout}>
            <IconLogout className="!size-5" />
            <span>Logout</span>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>

  );
}
