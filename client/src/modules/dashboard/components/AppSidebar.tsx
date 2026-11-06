"use client";

import {
  BookOpen,
  Boxes,
  LayoutDashboard,
  PhoneCall,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const links = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Credit Ledger", href: "/dashboard/credit-ledger", icon: BookOpen },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Shipments", href: "/dashboard/shipments", icon: Truck },
  { title: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { title: "Call Logs", href: "/dashboard/call-logs", icon: PhoneCall },
];

export function AppSidebar({ footer }: { footer: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3.5 mb-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
          <Image src="/logo.svg" alt="" width={28} height={28} priority />
          <span className="text-base font-semibold text-sidebar-foreground">
            BharatVoice
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href} className="mb-2">
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={
                      href === "/dashboard"
                        ? pathname === href
                        : pathname.startsWith(href)
                    }
                    className="text-black font-medium [&_svg]:text-sidebar-foreground/50 data-active:[&_svg]:text-sidebar-foreground"
                  >
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
    </Sidebar>
  );
}
