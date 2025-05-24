import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rangeOptions } from "../utils";
import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
interface ZoneFilterProps {
  zoneOptions: { id: string | number; label: string }[];
  selectedZone: string;
  setSelectedZone: (id: string) => void;
  selectedRange: number;
  setSelectedRange: (range: number) => void;
}

export function ZoneFilter({
  zoneOptions,
  selectedZone,
  setSelectedZone,
  selectedRange,
  setSelectedRange,
}: ZoneFilterProps) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <label className="block text-sm font-medium text-gray-700">
        選擇廠區
      </label>
      <Select value={selectedZone} onValueChange={setSelectedZone}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="全部廠區" />
        </SelectTrigger>
        <SelectContent>
          {zoneOptions.map((z) => (
            <SelectItem key={z.id} value={String(z.id)}>
              {z.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="block text-sm font-medium text-gray-700">
        時間區間
      </label>
      <Select
        value={String(selectedRange)}
        onValueChange={(value) => setSelectedRange(Number(value))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="選擇區間" />
        </SelectTrigger>
        <SelectContent>
          {rangeOptions.map((r) => (
            <SelectItem key={r.value} value={String(r.value)}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        onClick={() => router.refresh()}
      >
        <RefreshCcwIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
