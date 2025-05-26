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
import {
  UserPublic,
  ZonePublic,
  listUsersUserGet,
  listZonesZoneGet,
} from "@/app/client";
import { ZoneDataTable } from "@/components/table/zone-data-table";

export default function Page() {
  const { status } = useSession();
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [zones, setZones] = useState<ZonePublic[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: users } = await listUsersUserGet();
      if (users) {
        setUsers(users?.data);
      }
    };
    const fetchZones = async () => {
      const { data: zones } = await listZonesZoneGet();
      if (zones) {
        setZones(zones?.data);
      }
    };
    fetchUsers();
    fetchZones();
  }, []);

  if (status === "loading" || status === "unauthenticated") {
    return;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Zones Management</CardTitle>
            <CardDescription>
              Manage zones and their regions within the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZoneDataTable data={zones} setData={setZones} />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
