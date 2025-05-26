"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { LoginDialog } from "@/components/login-dialog";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { createSessionSessionPost } from "../client";
import { toast } from "sonner";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [notAuthenticated, setNotAuthenticated] = useState(false);

  useEffect(() => {
    async function setBackendSession() {
      if (session?.idToken) {
        try {
          console.log("setBackendSession");
          const { error } = await createSessionSessionPost({
            body: {
              id_token: session?.idToken,
            },
          });
          if (error) {
            throw new Error(`${error.detail}`);
          }
          console.log("setBackendSession success");
        } catch (error) {
          setNotAuthenticated(true);
          toast.error(`${error}`);
        }
      }
    }
    setBackendSession();
  }, [session]);

  if (status === "unauthenticated" || notAuthenticated) {
    return <LoginDialog />;
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
