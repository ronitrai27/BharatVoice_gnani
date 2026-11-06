"use client";

import { BookOpen, Boxes, Mic, Phone, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Set by the /welcome flow right before it sends the user here, so the
// dialog shows once for a brand-new user and not on later visits.
export const WELCOME_DIALOG_KEY = "gnani:show-welcome-dialog";
export const WELCOME_AGENT_KEY = "gnani:welcome-agent-name";

const NEXT_STEPS = [
  { label: "Manage shipments", icon: Truck },
  { label: "Manage inventory", icon: Boxes },
  { label: "Keep your credit ledger", icon: BookOpen },
];

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [agent, setAgent] = useState("your agent");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(WELCOME_DIALOG_KEY)) {
        sessionStorage.removeItem(WELCOME_DIALOG_KEY);
        const name = sessionStorage.getItem(WELCOME_AGENT_KEY);
        if (name) setAgent(name);
        setOpen(true);
      }
    } catch {}
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-5 overflow-hidden p-6 sm:max-w-md">
        {/* biome-ignore lint/performance/noImgElement: decorative static svg */}
        <img
          src="/flower.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-10 w-44 select-none"
        />
        <DialogHeader className="relative pr-16">
          <DialogTitle className="text-lg">Welcome to BharatVoice</DialogTitle>
          <DialogDescription>
            Your account is all set up. Glad to have you here.
          </DialogDescription>
        </DialogHeader>

        <div className="relative grid gap-2.5">
          <p className="text-sm font-medium">
            Here&apos;s what you can do next
          </p>
          <ul className="grid gap-2">
            {NEXT_STEPS.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-lg border bg-neutral-50 px-3 py-2.5 text-sm"
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative grid gap-3 rounded-xl border bg-neutral-50 p-4">
          <p className="text-sm font-medium">Say hello to {agent}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="size-4 shrink-0" />
            Say &ldquo;Hello {agent}&rdquo; to activate
          </div>
          <Button type="button" className="w-full">
            <Phone />
            Make the call to talk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
