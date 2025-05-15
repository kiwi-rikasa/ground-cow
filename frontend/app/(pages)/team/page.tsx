"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { UserDataTable } from "@/components/user-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPublic, listUsersUserGet } from "@/app/client";

export default function Page() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserPublic[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: users } = await listUsersUserGet();
      if (users) {
        setUsers(users?.data);
      }
    };
    fetchUsers();
  }, []);

  if (status === "loading") {
    return;
  }

  if (!session) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
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
        <div className="flex flex-1 flex-col p-6">
          <Suspense fallback={<div>Loading...</div>}>
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  Manage users and their roles within the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserDataTable data={users} setData={setUsers} />
              </CardContent>
            </Card>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
