"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { UserDataTable } from "@/components/user-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { listReportsReportGet } from "@/app/client/sdk.gen";

// 模擬用戶數據，注意：我們在這裡使用 as const 來確保字符串字面量類型
const mockUsers = [
  {
    user_id: 1,
    user_created_at: "2024-01-01T09:00:00Z",
    user_email: "admin@example.com",
    user_name: "Admin User",
    user_role: "admin" as const,
  },
  {
    user_id: 2,
    user_created_at: "2024-01-02T10:30:00Z",
    user_email: "control1@example.com",
    user_name: "Control Manager",
    user_role: "control" as const,
  },
  {
    user_id: 3,
    user_created_at: "2024-01-03T14:15:00Z",
    user_email: "operator1@example.com",
    user_name: "Field Operator 1",
    user_role: "operator" as const,
  },
  {
    user_id: 4,
    user_created_at: "2024-01-04T11:45:00Z",
    user_email: "operator2@example.com",
    user_name: "Field Operator 2",
    user_role: "operator" as const,
  },
  {
    user_id: 5,
    user_created_at: "2024-01-05T16:30:00Z",
    user_email: "control2@example.com",
    user_name: "Control Assistant",
    user_role: "control" as const,
  },
];

export default function Page() {
  const { data: session, status } = useSession();

  // useEffect(() => {
  //   const fetchReports = async () => {
  //     const { data: reports } = await listReportsReportGet();
  //     console.log("reports", reports);
  //   };
  //   fetchReports();
  // }, []);

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
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage users and their roles within the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserDataTable data={mockUsers} />
              </CardContent>
            </Card>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
