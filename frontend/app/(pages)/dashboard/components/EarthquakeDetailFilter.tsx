import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface EarthquakeDetailFilterProps {
  earthquakeList: { id: number; label: string }[];
  selectedEq: number;
  setSelectedEq: (id: number) => void;
}

export function EarthquakeDetailFilter({
  earthquakeList,
  selectedEq,
  setSelectedEq,
}: EarthquakeDetailFilterProps) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="eq-filter"
        className="block text-sm font-medium text-gray-700"
      >
        選擇地震事件
      </label>
      <Select
        value={String(selectedEq)}
        onValueChange={(v) => setSelectedEq(Number(v))}
      >
        <SelectTrigger id="eq-filter" className="w-[220px]">
          <SelectValue placeholder="選擇地震" />
        </SelectTrigger>
        <SelectContent>
          {earthquakeList.map((eq) => (
            <SelectItem key={eq.id} value={String(eq.id)}>
              {eq.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        onClick={() => {
          router.refresh();
          toast.success("地震詳細資料已更新");
        }}
      >
        <RefreshCcwIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
