import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Calendar, X, Check, ChevronDown } from "lucide-react";
import { format, isValid, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

import { getPresetDateRange, PRESET_RANGES } from "@/lib/date-presets";

const DateRangeFilter = ({
  dateRange,
  setDateRange,
  isFilterApplied,
  setIsFilterApplied,
  onApply,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTempDateRange(dateRange);
      setErrors({});

      const matching = PRESET_RANGES.find((p) => {
        if (p.value === "custom") return false;
        const r = getPresetDateRange(p.value);
        return r.from === dateRange.from && r.to === dateRange.to;
      });
      setSelectedPreset(matching?.value || "custom");
    }
  }, [open, dateRange]);

  const validateDateRange = () => {
    const newErrors = {};

    if (tempDateRange.from && !isValid(new Date(tempDateRange.from))) {
      newErrors.from = "Invalid date";
    }
    if (tempDateRange.to && !isValid(new Date(tempDateRange.to))) {
      newErrors.to = "Invalid date";
    }

    if (tempDateRange.from && tempDateRange.to) {
      const from = new Date(tempDateRange.from);
      const to = new Date(tempDateRange.to);
      if (isAfter(from, to)) {
        newErrors.range = "Start date cannot be after end date";
      }
    }

    // Future dates are now ALLOWED → we removed the two lines
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePresetSelect = (value) => {
    setSelectedPreset(value);
    if (value === "custom") return;
    const range = getPresetDateRange(value);
    setTempDateRange(range);
    setErrors({});
  };

  const handleApply = async () => {
    if (!validateDateRange()) return;

    setIsSubmitting(true);
    try {
      setDateRange(tempDateRange);
      setIsFilterApplied(true);
      if (onApply) await onApply(tempDateRange);

      const matched = PRESET_RANGES.find((p) => {
        const r = getPresetDateRange(p.value);
        return r.from === tempDateRange.from && r.to === tempDateRange.to;
      });
      setSelectedPreset(matched?.value || "custom");

      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setTempDateRange({ from: "", to: "" });
    setSelectedPreset("custom");
    setErrors({});
    if (onClear) onClear();
    setOpen(false);
  };

  const getButtonLabel = () => {
    if (!isFilterApplied || (!dateRange.from && !dateRange.to)) {
      return "Filter by date";
    }
    if (dateRange.from && dateRange.to) {
      return dateRange.from === dateRange.to
        ? format(new Date(dateRange.from), "MMM d, yyyy")
        : `${format(new Date(dateRange.from), "MMM d")} – ${format(
            new Date(dateRange.to),
            "MMM d"
          )}`;
    }
    return dateRange.from
      ? `From ${format(new Date(dateRange.from), "MMM d")}`
      : `Until ${format(new Date(dateRange.to), "MMM d")}`;
  };

  const getMaxDate = () => format(new Date(), "yyyy-MM-dd");

  const handleFromChange = (value) => {
    setTempDateRange((prev) => ({ ...prev, from: value }));
    if (
      value &&
      tempDateRange.to &&
      isAfter(new Date(value), new Date(tempDateRange.to))
    ) {
      setTempDateRange((prev) => ({ ...prev, to: "" }));
    }
    if (selectedPreset !== "custom") setSelectedPreset("custom");
  };

  const handleToChange = (value) => {
    setTempDateRange((prev) => ({ ...prev, to: value }));
    if (selectedPreset !== "custom") setSelectedPreset("custom");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isFilterApplied ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-2 font-medium transition-all",
            isFilterApplied &&
              "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="truncate max-w-[180px]">{getButtonLabel()}</span>
          {isFilterApplied && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 rounded-full flex items-center justify-center"
            >
              <Check className="w-3 h-3" />
            </Badge>
          )}
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 overflow-hidden shadow-xl border bg-card"
        align="end"
        sideOffset={8}
      >
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-5 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Date Filter</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Narrow down your memories
              </p>
            </div>
            {isFilterApplied && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 px-2 text-xs hover:text-destructive"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_RANGES.filter((p) => p.value !== "custom").map((p) => (
              <Button
                key={p.value}
                variant={selectedPreset === p.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium justify-start",
                  selectedPreset === p.value && "shadow-sm"
                )}
                onClick={() => handlePresetSelect(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Range */}
        <div className="border-t bg-muted/30 px-4 py-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Custom Range</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={tempDateRange.from}
                onChange={(e) => handleFromChange(e.target.value)}
                max={tempDateRange.to || getMaxDate()}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={tempDateRange.to}
                onChange={(e) => handleToChange(e.target.value)}
                min={tempDateRange.from}
                max={getMaxDate()}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {errors.range && (
            <p className="text-xs text-destructive -mt-1">{errors.range}</p>
          )}
        </div>

        {/* Selected Summary */}
        {(tempDateRange.from || tempDateRange.to) && (
          <div className="px-4 py-3 bg-primary/5 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Selected:</span>
              <span className="font-medium text-foreground">
                {tempDateRange.from
                  ? format(new Date(tempDateRange.from), "MMM d")
                  : "?"}{" "}
                →{" "}
                {tempDateRange.to
                  ? format(new Date(tempDateRange.to), "MMM d, yyyy")
                  : "?"}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Button
              onClick={handleApply}
              disabled={
                isSubmitting || (!tempDateRange.from && !tempDateRange.to)
              }
              size="sm"
              className="flex-1 h-9 text-sm"
            >
              {isSubmitting ? "Applying..." : "Apply"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="h-9 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
