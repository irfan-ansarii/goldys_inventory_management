"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components//ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useRouterStuff } from "@/hooks/use-router-stuff";

const SearchBar = ({
  containerClassName,
  inputClassName,
}: {
  containerClassName?: string;
  inputClassName?: string;
}) => {
  const { queryParams, searchParamsObj } = useRouterStuff();

  const [value, setValue] = useState(searchParamsObj.q || "");

  useEffect(() => {
    if (value) {
      queryParams({ set: { q: value } });
    } else if (!value || searchParamsObj.q === "") {
      queryParams({ del: "q" });
    }
  }, [value]);

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
        onClick={() => setValue("")}
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
