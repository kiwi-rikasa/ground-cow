import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    </div>
  );
}
