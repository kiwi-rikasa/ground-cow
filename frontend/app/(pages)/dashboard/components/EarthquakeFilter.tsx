import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rangeOptions } from "../utils";

interface EarthquakesFilterProps {
  selectedRange: string;
  setSelectedRange: (range: string) => void;
}

export function EarthquakeFilter({
  selectedRange,
  setSelectedRange,
}: EarthquakesFilterProps) {
  return (
    <div className="flex items-center gap-4">
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
