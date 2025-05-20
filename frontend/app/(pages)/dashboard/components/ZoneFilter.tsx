import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ZoneFilterProps {
  zoneOptions: { id: string | number; label: string }[];
  rangeOptions: { value: string; label: string }[];
  selectedZone: string;
  setSelectedZone: (id: string) => void;
  selectedRange: string;
  setSelectedRange: (range: string) => void;
}

export function ZoneFilter({
  zoneOptions,
  rangeOptions,
  selectedZone,
  setSelectedZone,
  selectedRange,
  setSelectedRange,
}: ZoneFilterProps) {
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
      <Select value={selectedRange} onValueChange={setSelectedRange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="選擇區間" />
        </SelectTrigger>
        <SelectContent>
          {rangeOptions.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
