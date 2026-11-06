"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "./UserAvatar";

export function UserMenu({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const router = useRouter();

  function logout() {
    const request = authClient.signOut().then((res) => {
      if (res.error) throw new Error(res.error.message);
    });
    toast.promise(request, {
      loading: "Logging you out...",
      success: "Logged out",
      error: "Could not log out. Try again.",
    });
    request.then(() => router.replace("/auth")).catch(() => {});
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        openOnHover
        delay={0}
        className="flex items-center gap-1 rounded-full outline-none"
      >
        <UserAvatar name={name} image={image} />
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
