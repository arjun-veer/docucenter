"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_TYPES } from "@/lib/constants";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("q") ?? ""
  );
  const [locationValue, setLocationValue] = useState(
    searchParams.get("location") ?? ""
  );

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({
      q: searchValue.trim(),
      location: locationValue.trim(),
    });
  }

  function handleJobTypeChange(value: string) {
    updateParams({ type: value });
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-col sm:flex-row gap-3"
    >
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs, companies..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="relative w-full sm:w-[200px]">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Location..."
          value={locationValue}
          onChange={(e) => setLocationValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={handleJobTypeChange}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Job Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Job Types</SelectItem>
          {JOB_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
