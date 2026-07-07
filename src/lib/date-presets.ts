// src/utils/date-presets.ts

import { format } from "date-fns";

export const PRESET_RANGES = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7days" },
  { label: "Last 30 Days", value: "last30days" },
  { label: "This Month", value: "thismonth" },
  { label: "Last Month", value: "lastmonth" },
  { label: "Custom", value: "custom" },
] as const;

export const getPresetDateRange = (preset: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return {
        from: format(today, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
        label: "Today",
      };
    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        from: format(yesterday, "yyyy-MM-dd"),
        to: format(yesterday, "yyyy-MM-dd"),
        label: "Yesterday",
      };
    case "last7days":
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 6);
      return {
        from: format(last7Days, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
        label: "Last 7 Days",
      };
    case "last30days":
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 29);
      return {
        from: format(last30Days, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
        label: "Last 30 Days",
      };
    case "thismonth":
      const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        from: format(firstDayThisMonth, "yyyy-MM-dd"),
        to: format(lastDayThisMonth, "yyyy-MM-dd"),
        label: "This Month",
      };
    case "lastmonth":
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        from: format(firstDayLastMonth, "yyyy-MM-dd"),
        to: format(lastDayLastMonth, "yyyy-MM-dd"),
        label: "Last Month",
      };
    default:
      return { from: "", to: "", label: "" };
  }
};

