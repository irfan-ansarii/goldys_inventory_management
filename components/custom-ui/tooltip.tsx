import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  variant?: "tooltip" | "card";
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Tooltip = ({
  variant = "tooltip",
  content,
  children,
  className,
}: Props) => {
  if (variant === "card") {
    return (
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>{children}</HoverCardTrigger>
        <HoverCardContent className={cn("p-2", className)}>
          {content}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <TooltipRoot delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={cn("px-2 py-1", className)}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
};

export default Tooltip;
