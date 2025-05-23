import { TableCell } from "@/components/ui/table";

import { TableBody } from "@/components/ui/table";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { EarthquakeDashboardResponse } from "@/app/client";

export function EarthquakeProgressTable({
  earthquakeProgress,
}: {
  earthquakeProgress: EarthquakeDashboardResponse["earthquake_progress"];
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>各廠區回報進度</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>zone</TableHead>
                <TableHead>event severity</TableHead>
                <TableHead>alert state</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earthquakeProgress.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.zone}</TableCell>
                  <TableCell>{row.severity}</TableCell>
                  <TableCell>{row.state}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
