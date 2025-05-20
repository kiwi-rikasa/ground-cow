import { IconCirclePlusFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  createReportReportPost,
  listReportsReportGet,
  listAlertsAlertGet,
  ReportPublic,
  AlertPublic,
} from "@/app/client/";
import { useState, useEffect, useRef, useCallback } from "react";

interface CreateReportDialogProps {
  initialAlertId?: number;
  trigger?: React.ReactNode;
}

export function CreateReportDialog({
  initialAlertId,
  trigger,
}: CreateReportDialogProps) {
  const [alertId, setAlertId] = useState(initialAlertId || 0);
  const [zoneId, setZoneId] = useState("");
  const [action, setAction] = useState(false);
  const [damage, setDamage] = useState(false);
  const [alertIdError, setAlertIdError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(
    initialAlertId?.toString() || ""
  );
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

      handleClear();
    } catch (error) {
      console.error("Report creation failed", error);
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

  const handleAlertIdChange = useCallback(
    (value: string) => {
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
    },
    [reports, alerts]
  );

  useEffect(() => {
    if (initialAlertId) {
      handleAlertIdChange(initialAlertId.toString());
    }
  }, [handleAlertIdChange, initialAlertId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <SidebarMenuButton
            tooltip="Quick Create"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer"
          >
            <IconCirclePlusFilled />
            <span>Create Report</span>
          </SidebarMenuButton>
        )}
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
                <SelectItem value="true" className="cursor-pointer text-left">
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
  );
}
