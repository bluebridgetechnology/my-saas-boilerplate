"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from '@iconify/react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AdminNavMain } from "./admin-nav-main"
import { AdminNavSecondary } from "./admin-nav-secondary"
import { AdminNavUser } from "./admin-nav-user"

const adminNavData = {
  user: {
    name: "Admin User",
    email: "admin@resizesuite.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "solar:widget-bold-duotone",
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: "solar:users-group-rounded-bold-duotone",
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: "solar:chart-bold-duotone",
    },
    {
      title: "Revenue",
      url: "/admin/revenue",
      icon: "solar:dollar-bold-duotone",
    },
    {
      title: "Support",
      url: "/admin/support",
      icon: "solar:headphones-round-sound-bold-duotone",
    },
  ],
  navTools: [
    {
      title: "Ad Banners",
      url: "/admin/ad-banners",
      icon: "solar:advertising-bold-duotone",
    },
    {
      title: "Code Injection",
      url: "/admin/code-injections",
      icon: "solar:code-bold-duotone",
    },
    {
      title: "Feature Flags",
      url: "/admin/feature-flags",
      icon: "solar:flag-bold-duotone",
    },
    {
      title: "API Keys",
      url: "/admin/api-keys",
      icon: "solar:key-bold-duotone",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: "solar:settings-bold-duotone",
    },
    {
      title: "Help & Support",
      url: "/admin/help",
      icon: "solar:question-circle-bold-duotone",
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin">
                <Icon icon="solar:shield-check-bold-duotone" className="!size-5 text-blue-600" />
                <span className="text-base font-semibold">ResizeSuite Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={adminNavData.navMain} />
        <AdminNavTools items={adminNavData.navTools} />
        <AdminNavSecondary items={adminNavData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={adminNavData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

// AdminNavTools component for management tools
function AdminNavTools({
  items,
}: {
  items: {
    title: string
    url: string
    icon: string
  }[]
}) {
  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <div className="px-2 py-2">
        <div className="text-xs font-medium text-muted-foreground px-2 mb-2">
          Management Tools
        </div>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  <Icon icon={item.icon} className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </div>
  )
}
