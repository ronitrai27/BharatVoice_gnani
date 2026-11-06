"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const LABELS: Record<string, string> = {
  "credit-ledger": "Credit Ledger",
  orders: "Orders",
  shipments: "Shipments",
  inventory: "Inventory",
  "call-logs": "Call Logs",
};

export function DashboardHeader({ avatar }: { avatar: React.ReactNode }) {
  const pathname = usePathname();
  // "/dashboard/orders" -> ["orders"]; "/dashboard" -> []
  const rest = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = rest.map((seg, i) => ({
    label: LABELS[seg] ?? seg,
    href: `/dashboard/${rest.slice(0, i + 1).join("/")}`,
  }));

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-neutral-50 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {crumbs.length === 0 ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {crumbs.map((c, i) => (
            <Fragment key={c.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === crumbs.length - 1 ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={c.href} />}>
                    {c.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">{avatar}</div>
    </header>
  );
}
