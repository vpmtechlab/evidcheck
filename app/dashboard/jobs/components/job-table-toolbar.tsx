"use client";

import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export interface JobFilterState {
  search: string;
  sources: string[];
  serviceTypes: string[];
  statuses: string[];
  dateRange: DateRange | undefined;
}

interface JobTableToolbarProps {
  filters: JobFilterState;
  onFilterChange: <K extends keyof JobFilterState>(
    key: K,
    value: JobFilterState[K],
  ) => void;
  onResetFilters: () => void;
}

const SOURCE_OPTIONS = [
  { value: "web_api", label: "Web Dashboard" },
  { value: "rest_api", label: "REST API" },
  { value: "sandbox", label: "Sandbox Test" },
];

const PRODUCT_OPTIONS = [
  { value: "business_registration", label: "Business Check (BRS)" },
  { value: "national_id", label: "Individual ID (IPRS)" },
  { value: "kra_pin_check", label: "KRA PIN Checker" },
  { value: "crb_check", label: "CRB Credit Check" },
];

const STATUS_OPTIONS = [
  { value: "approved", label: "Approved" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" },
];

export function JobTableToolbar({
  filters,
  onFilterChange,
  onResetFilters,
}: JobTableToolbarProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.sources.length > 0 ||
    filters.serviceTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange !== undefined;

  return (
    <div className="p-4 border border-gray-200 border-b-0 rounded-t-xl bg-gray-50/50 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by Job ID or keyword…"
            className="pl-9 bg-white border-gray-200 h-9 text-xs"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter size={11} />
            Filters
          </span>

          {/* Source Multi-Select */}
          <MultiSelect
            options={SOURCE_OPTIONS}
            selected={filters.sources}
            onChange={(val) => onFilterChange("sources", val)}
            placeholder="All Sources"
          />

          {/* Product Multi-Select */}
          <MultiSelect
            options={PRODUCT_OPTIONS}
            selected={filters.serviceTypes}
            onChange={(val) => onFilterChange("serviceTypes", val)}
            placeholder="All Products"
          />

          {/* Status Multi-Select */}
          <MultiSelect
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(val) => onFilterChange("statuses", val)}
            placeholder="All Statuses"
          />

          {/* Date Range Picker */}
          <DateRangePicker
            dateRange={filters.dateRange}
            onChange={(val) => onFilterChange("dateRange", val)}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 rounded-md gap-1 font-semibold"
            >
              <RotateCcw size={13} /> Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
