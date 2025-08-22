"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useState } from "react";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showEndCircle?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showEndCircle = false, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    {showEndCircle && (
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

interface HorizontalFiltersProps {
  className?: string;
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  specialisation: string[];
  disorders: string[];
  counselling: string[];
  sortBy: string;
}

export default function HorizontalFilters({
  className,
  onFilterChange,
}: HorizontalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    specialisation: [],
    disorders: [],
    counselling: [],
    sortBy: "featured",
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    let count = 0;
    if (updated.specialisation.length) count += updated.specialisation.length;
    if (updated.disorders.length) count += updated.disorders.length;
    if (updated.counselling.length) count += updated.counselling.length;

    setActiveFiltersCount(count);
    onFilterChange?.(updated);
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    if (type === "sortBy") {
      updateFilters({ [type]: value } as Partial<FilterState>);
      return;
    }

    const currentValues = filters[type] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateFilters({ [type]: newValues } as Partial<FilterState>);
  };

  const clearFilters = () => {
    const clearedState = {
      specialisation: [],
      disorders: [],
      counselling: [],
      sortBy: "featured",
    };
    setFilters(clearedState);
    setActiveFiltersCount(0);
    onFilterChange?.(clearedState);
  };
  
  const specialisations = ["Cognitive Behavioral Therapy (CBT)", "Psychodynamic Therapy", "Humanistic Therapy", "Family Therapy", "Mindfulness-based Cognitive Therapy (MBCT)"];
  const disorders = ["PTSD", "Depression", "Anxiety Disorders", "Bipolar Disorder", "OCD", "Eating Disorders"];
  const counsellingTypes = ["Child Therapy", "Stress Management", "Anger Management", "Career & Life Coaching", "Relationships & Marriage", "Addiction & Substance Abuse"];

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Experience: High to Low", value: "exp-desc" },
    { label: "Experience: Low to High", value: "exp-asc" },
    { label: "Newest", value: "newest" },
  ];

  const ActiveFilterBadges = () => {
    const activeFilters = [
      ...filters.specialisation.map((val) => ({ type: "specialisation", value: val })),
      ...filters.disorders.map((val) => ({ type: "disorders", value: val })),
      ...filters.counselling.map((val) => ({ type: "counselling", value: val })),
    ];

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {activeFilters.map((filter, index) => (
          <Badge
            key={`${filter.type}-${filter.value}-${index}`}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1"
          >
            {filter.value}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-1"
              onClick={() =>
                toggleFilter(filter.type as keyof FilterState, filter.value)
              }
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        )}
      </div>
    );
  };

  const FilterPopover = ({ title, options, filterKey }: { title: string; options: string[]; filterKey: keyof FilterState }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          {title}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <ScrollArea className={options.length > 7 ? "h-60" : ""}>
          <div className="space-y-2 pr-4">
            {options.map((option) => (
              <div key={option} className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start w-full font-normal text-left h-auto",
                    (filters[filterKey] as string[]).includes(option) && "font-medium"
                  )}
                  onClick={() => toggleFilter(filterKey, option)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="whitespace-normal">{option}</span>
                    {(filters[filterKey] as string[]).includes(option) && (
                      <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      <div className={cn("w-full p-6", className)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            
            <div className="hidden sm:flex flex-wrap items-center gap-2">
                <FilterPopover title="Specialisation" options={specialisations} filterKey="specialisation" />
                <FilterPopover title="Disorders" options={disorders} filterKey="disorders" />
                <FilterPopover title="Counselling" options={counsellingTypes} filterKey="counselling" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="h-3 w-3 mr-1" />
              All Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Sort by:
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {sortOptions.find((opt) => opt.value === filters.sortBy)
                    ?.label || "Featured"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className={cn(
                      filters.sortBy === option.value && "font-medium"
                    )}
                    onClick={() => toggleFilter("sortBy", option.value)}
                  >
                    {option.label}
                    {filters.sortBy === option.value && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ActiveFilterBadges />

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="space-y-6 pr-4">
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Specialisation</h3>
                    <div className="space-y-2">
                      {specialisations.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "justify-start w-full font-normal",
                            filters.specialisation.includes(item) &&
                              "font-medium"
                          )}
                          onClick={() => toggleFilter("specialisation", item)}
                        >
                          <div className="flex items-center justify-between w-full">
                            {item}
                            {filters.specialisation.includes(item) && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Disorders</h3>
                    <div className="space-y-2">
                      {disorders.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "justify-start w-full font-normal",
                            filters.disorders.includes(item) && "font-medium"
                          )}
                          onClick={() => toggleFilter("disorders", item)}
                        >
                          <div className="flex items-center justify-between w-full">
                            {item}
                            {filters.disorders.includes(item) && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                   <div className="space-y-3">
                    <h3 className="text-sm font-medium">Counselling</h3>
                    <div className="space-y-2">
                      {counsellingTypes.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "justify-start w-full font-normal",
                            filters.counselling.includes(item) && "font-medium"
                          )}
                          onClick={() => toggleFilter("counselling", item)}
                        >
                          <div className="flex items-center justify-between w-full">
                            {item}
                            {filters.counselling.includes(item) && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button variant="outline" onClick={clearFilters}>
                  Clear all
                </Button>
                <Button onClick={() => setShowMobileFilters(false)}>
                  Apply filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}