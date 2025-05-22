"use client";

import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { UserDataTable } from "@/components/table/user-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPublic, listUsersUserGet } from "@/app/client";

export default function Page() {
  const { status } = useSession();
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

  if (status === "loading" || status === "unauthenticated") {
    return;
  }

  return (
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
  );
}
