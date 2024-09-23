"use client";
import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components//ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouterStuff } from "@/hooks/use-router-stuff";

// Debounce helper function to prevent frequent updates
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Cleanup on unmount or value change
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchBar = ({
  containerClassName,
  inputClassName,
}: {
  containerClassName?: string;
  inputClassName?: string;
}) => {
  const { queryParams, searchParamsObj } = useRouterStuff();
  const [value, setValue] = useState(searchParamsObj.q || "");

  // Debounce the value to prevent excessive query updates
  const debouncedValue = useDebounce(value, 300); // Adjust the delay as needed

  useEffect(() => {
    if (debouncedValue) {
      queryParams({ set: { q: debouncedValue } });
    } else if (searchParamsObj.q !== "") {
      queryParams({ del: "q" });
    }
  }, [debouncedValue]); // Only runs when the debounced value changes

  // Memoizing the clear input function to prevent re-renders
  const clearInput = useCallback(() => {
    setValue("");
  }, []);

  return (
    <div className={cn("relative", containerClassName)}>
      <span className="absolute left-0 inset-y-0 px-3 pointer-events-none inline-flex items-center justify-center">
        <Search className="w-4 h-4" />
      </span>
      <Input
        placeholder="Search..."
        className={cn("pl-10", inputClassName)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Badge
        variant="secondary"
        onClick={clearInput}
        className={`absolute justify-center right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 p-0 ${
          value ? "opacity-100" : "opacity-0"
        }`}
      >
        <X className="w-3 h-3" />
      </Badge>
    </div>
  );
};

export default SearchBar;
