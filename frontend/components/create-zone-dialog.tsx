import { IconMapPin } from "@tabler/icons-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ZonePublic, createZoneZonePost } from "@/app/client/";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

interface CreateZoneDialogProps {
  trigger?: React.ReactNode;
  onZoneCreated?: (newZone: ZonePublic) => void;
}

export function CreateZoneDialog({
  trigger,
  onZoneCreated,
}: CreateZoneDialogProps) {
  const [zoneName, setZoneName] = useState<string | undefined>("");
  const [zoneRegions, setZoneRegions] = useState("");
  const [zoneNote, setZoneNote] = useState("");
  const [open, setOpen] = useState(false);

  const handleZoneCreate = async () => {
    if (!zoneName || !zoneRegions || !zoneNote) {
      toast({ message: "Please fill in all fields", type: "error" });
      return;
    }
    try {
      const result = await createZoneZonePost({
        body: {
          zone_name: zoneName,
          zone_regions: zoneRegions,
          zone_note: zoneNote,
        },
      });

      toast({ message: "Zone created successfully", type: "success" });
      if (onZoneCreated && result.data) {
        onZoneCreated(result.data);
      }
      handleClear();
      setOpen(false);
    } catch (error) {
      console.error("Zone creation failed", error);
      toast({ message: "Failed to create zone", type: "error" });
    }
  };

  const handleClear = () => {
    setZoneName("");
    setZoneRegions("");
    setZoneNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="cursor-pointer">
            <IconMapPin className="mr-1 size-4" />
            Add Zone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Zone</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new zone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zoneName" className="text-right">
              Name
            </Label>
            <Input
              id="zoneName"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Fab A"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zoneRegions" className="text-right">
              Regions
            </Label>
            <Input
              id="zoneRegions"
              value={zoneRegions}
              onChange={(e) => setZoneRegions(e.target.value)}
              className="col-span-3"
              placeholder="e.g. North Wing, South Wing"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zoneNote" className="text-right">
              Note
            </Label>
            <Textarea
              id="zoneNote"
              value={zoneNote}
              onChange={(e) => setZoneNote(e.target.value)}
              className="col-span-3"
              placeholder="Enter any notes for this zone"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleClear();
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleZoneCreate}
            className="cursor-pointer"
            disabled={!zoneName || !zoneRegions}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
