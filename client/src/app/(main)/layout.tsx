import { headers } from "next/headers";
import { Suspense } from "react";
import { getSessionSafe } from "@/lib/session";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { DashboardShell } from "@/modules/dashboard/components/DashboardShell";
import { UserAvatar } from "@/modules/dashboard/components/UserAvatar";
import { UserMenu } from "@/modules/dashboard/components/UserMenu";

async function getUser() {
  const session = await getSessionSafe(await headers());
  if (!session) return { name: "User", email: "", image: null };
  const { name, email, image } = session.user;
  return { name: name?.trim() || email.split("@")[0], email, image };
}

async function HeaderAvatar() {
  const user = await getUser();
  return <UserMenu name={user.name} image={user.image} />;
}

async function SidebarUser() {
  const user = await getUser();
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-white p-2">
      <UserAvatar name={user.name} image={user.image} />
      <div className="grid min-w-0 flex-1 leading-tight">
        <span className="truncate text-sm font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
    </div>
  );
}

const avatarFallback = <div className="size-8 rounded-full bg-muted" />;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      header={
        <DashboardHeader
          avatar={
            <Suspense fallback={avatarFallback}>
              <HeaderAvatar />
            </Suspense>
          }
        />
      }
      footer={
        <Suspense fallback={<div className="h-14 rounded-lg bg-muted" />}>
          <SidebarUser />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  );
}
