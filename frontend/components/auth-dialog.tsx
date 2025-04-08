"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AuthDialog() {
  const { data: session, status } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const open = searchParams.get("open");
    if (open) {
      setDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      setDialogOpen(false);
      router.push("/");
    } else {
      setDialogOpen(true);
    }
  }, [router, session, status]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
      router.push("/");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Event Logging System</DialogTitle>
          <DialogDescription>
            Please sign to access the website.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {session?.user ? (
            <Button className="round-xl" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button className="round-xl" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
