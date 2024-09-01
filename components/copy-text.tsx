"use client";
import React, { ReactElement, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Clipboard, ClipboardCheck } from "lucide-react";

interface CopyTextProps<T extends React.ElementType> {
  textToCopy: string | undefined | null;
  className?: string;
  containerClass?: string;
  as?: T;
}

const CopyText = <T extends React.ElementType = "p">({
  textToCopy,
  className,
  containerClass,
  as,
  ...props
}: CopyTextProps<T> & React.ComponentPropsWithoutRef<T>) => {
  const [isCopied, setIsCopied] = useState(false);
  const Component = as || "p";

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
    toast.message("Copied to clipboard");
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2 justify-between overflow-hidden",
        containerClass
      )}
    >
      <Component
        className={cn(
          "leading-tight whitespace-break-spaces truncate",
          className
        )}
        {...props}
      >
        {textToCopy}
      </Component>
      <span
        onClick={handleCopy}
        className="cursor-pointer text-muted-foreground"
      >
        {isCopied ? (
          <ClipboardCheck className="w-4 h-4 text-green-600" />
        ) : (
          <Clipboard className="w-4 h-4" />
        )}
      </span>
    </div>
  );
};

export default CopyText;
