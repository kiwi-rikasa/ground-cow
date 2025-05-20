"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createReportReportPost,
  listReportsReportGet,
  listAlertsAlertGet,
  ReportPublic,
  AlertPublic,
} from "@/app/client/";
import { useState, useEffect, useRef, createContext } from "react";
import { useRouter } from "next/navigation";
import { Portal } from "@radix-ui/react-portal";

type ReportCreateContextType = {
  refetchTrigger: number;
  signalRefetch: () => void;
};

export const reportCreateContext = createContext<ReportCreateContextType>({
  refetchTrigger: 0,
  signalRefetch: () => {},
});

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  currentPath: string;
}) {
  const router = useRouter();
  const [alertId, setAlertId] = useState(0);
  const [zoneId, setZoneId] = useState("");
  const [action, setAction] = useState(false);
  const [damage, setDamage] = useState(false);
  const [alertIdError, setAlertIdError] = useState<string | null>(null);

  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
    visible: boolean;
  }>({ type: "success", message: "", visible: false });

  const [inputValue, setInputValue] = useState("");
  const [reports, setReports] = useState<ReportPublic[]>([]);
  const [alerts, setAlerts] = useState<AlertPublic[]>([]);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    async function fetchData() {
      if (dataFetchedRef.current) return;

      try {
        const [{ data: reports }, { data: alerts }] = await Promise.all([
          listReportsReportGet(),
          listAlertsAlertGet(),
        ]);

        if (reports && alerts) {
          setReports(reports.data);
          setAlerts(alerts.data);
          dataFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const handleReportCreate = async () => {
    try {
      await createReportReportPost({
        body: {
          report_action_flag: action,
          report_damage_flag: damage,
          report_reported_at: new Date().toISOString(),
          alert_id: alertId,
        },
      });

      setAlert({
        type: "success",
        message: "The report was created successfully.",
        visible: true,
      });

      setIsAnimatingIn(true);
      setTimeout(() => setIsAnimatingIn(false), 3000);
      setTimeout(() => setAlert((prev) => ({ ...prev, visible: false })), 3300);
    } catch (error) {
      console.error("Report creation failed", error);
      setAlert({
        type: "error",
        message: "Failed to create the report.",
        visible: true,
      });

      setIsAnimatingIn(true);
      setTimeout(() => setIsAnimatingIn(false), 3000);
      setTimeout(() => setAlert((prev) => ({ ...prev, visible: false })), 3300);
    }
  };

  const handleClear = () => {
    setAlertId(0);
    setAction(false);
    setDamage(false);
    setInputValue("");
    setAlertIdError(null);
    setZoneId("");
  };

  const handleAlertIdChange = (value: string) => {
    setInputValue(value);

    if (value.trim() === "") {
      setAlertId(0);
      setZoneId("");
      setAlertIdError(null);
      return;
    }

    if (!/^\d+$/.test(value)) {
      setAlertId(0);
      setZoneId("");
      setAlertIdError("Please enter a valid number");
      return;
    }

    const numericValue = Number(value);
    setAlertId(numericValue);

    const reportExist = reports.some((r) => r.alert_id === numericValue);
    const alertExist = alerts.some((a) => a.alert_id === numericValue);

    if (!alertExist) {
      setAlertIdError("This alert ID doesn't exist");
      setZoneId("");
    } else if (reportExist) {
      setAlertIdError("This alert already has a report.");
      setZoneId(
        String(alerts.find((a) => a.alert_id === numericValue)?.zone_id) || ""
      );
    } else {
      setAlertIdError(null);
      setZoneId(
        String(alerts.find((a) => a.alert_id === numericValue)?.zone_id) || ""
      );
    }
  };

  return (
    <>
      <Portal>
        {alert.visible && (
          <Alert
            className={cn(
              "fixed top-4 right-4 z-[9999] w-80 border shadow-lg rounded-md bg-white dark:bg-zinc-900 p-4",
              isAnimatingIn
                ? "animate-in fade-in slide-in-from-right duration-300"
                : "animate-out fade-out slide-out-to-right duration-300"
            )}
          >
            <Terminal className="h-4 w-4" />
            <AlertTitle>
              {alert.type === "error" ? "Error!" : "Success!"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
      </Portal>

      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Quick Create"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer"
                  >
                    <IconCirclePlusFilled />
                    <span>Create Report</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Report</DialogTitle>
                    <DialogDescription>
                      Fill the details to create a new report.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="alertId" className="text-right">
                        Alert ID
                      </Label>
                      <Input
                        id="alertId"
                        value={inputValue}
                        onChange={(e) => handleAlertIdChange(e.target.value)}
                        className={cn(
                          "col-span-3",
                          alertIdError && "border-red-500 ring-red-500"
                        )}
                      />
                      {alertIdError && (
                        <div className="col-start-2 col-span-3 text-sm text-red-500 text-left pr-1">
                          {alertIdError}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="zoneId" className="text-right">
                        Zone ID
                      </Label>
                      <Input
                        id="zoneId"
                        readOnly
                        value={zoneId}
                        className="col-span-3 bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="action" className="text-right">
                        Action
                      </Label>
                      <Select
                        value={String(action)}
                        onValueChange={(value) => setAction(value === "true")}
                      >
                        <SelectTrigger
                          id="action"
                          className="col-span-3 cursor-pointer w-full"
                        >
                          <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true" className="cursor-pointer">
                            True
                          </SelectItem>
                          <SelectItem value="false" className="cursor-pointer">
                            False
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="damage" className="text-right">
                        Damage
                      </Label>
                      <Select
                        value={String(damage)}
                        onValueChange={(value) => setDamage(value === "true")}
                      >
                        <SelectTrigger
                          id="damage"
                          className="col-span-3 cursor-pointer w-full"
                        >
                          <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="true"
                            className="cursor-pointer text-left"
                          >
                            True
                          </SelectItem>
                          <SelectItem value="false" className="cursor-pointer">
                            False
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      variant="outline"
                      onClick={handleClear}
                      className="cursor-pointer"
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleReportCreate}
                      className="cursor-pointer"
                      disabled={!!alertIdError || inputValue === ""}
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0 cursor-pointer"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`cursor-pointer ${
                    currentPath === item.url
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                  onClick={() => {
                    router.push(item.url);
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
