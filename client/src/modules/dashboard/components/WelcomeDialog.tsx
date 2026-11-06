"use client";

import { useEffect, useState } from "react";
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

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(WELCOME_DIALOG_KEY)) {
        sessionStorage.removeItem(WELCOME_DIALOG_KEY);
        setOpen(true);
      }
    } catch {}
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to BharatVoice</DialogTitle>
          <DialogDescription>
            Your account is all set up. Glad to have you here.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
