import React, { Children } from "react";
import Image from "next/image";
import {
  Avatar as AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";
import Tooltip from "./tooltip";

interface Props {
  className?: string;
  fallbackClassName?: string;
  src?: string | React.ReactNode;
  title?: React.ReactNode;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const randomCharacter =
  characters[Math.floor(Math.random() * characters.length + 1)];

const fallback = `https://api.dicebear.com/5.x/initials/svg?fontSize=36&seed=`;

const Avatar = ({ className, fallbackClassName, src, title }: Props) => {
  const isSourceString = typeof src === "string";

  const source =
    isSourceString && !src.startsWith("http") && !src.startsWith("data:")
      ? `${fallback}${src || randomCharacter}`
      : src;

  const component = (
    <AvatarRoot className={cn("border-2", className)}>
      {isSourceString && source && (
        <AvatarImage src={source as string} className="object-cover" asChild>
          <Image src={source as string} alt="logo" width={40} height={40} />
        </AvatarImage>
      )}

      <AvatarFallback className={`rounded-none bg-accent ${fallbackClassName}`}>
        <ImageIcon className="w-4 h-4" />
      </AvatarFallback>
    </AvatarRoot>
  );

  if (title) {
    return <Tooltip content={title}>{component}</Tooltip>;
  }

  return component;
};

export default Avatar;

export const AvatarGroup = ({
  max = 4,
  children,
  className,
}: {
  max?: number;
  children: React.ReactNode;
  className?: string;
}) => {
  const childrenWithProps = Children.toArray(children).map((child, index) =>
    React.cloneElement(child as React.ReactElement, {
      key: `avatar-${index}`,
    })
  );
  const childCount = childrenWithProps.length;

  const childrenShow = childrenWithProps.slice(0, max);
  const childrenHidden = childrenWithProps.slice(max, childCount);

  if (childCount > max) {
    childrenShow.push(
      <Tooltip
        content={<div className="grid grid-cols-4 gap-1">{childrenHidden}</div>}
        variant="card"
        key={childrenShow.length}
      >
        <AvatarRoot className="border-2">
          <AvatarFallback className="rounded-none">
            {`+${childCount - max}`}
          </AvatarFallback>
        </AvatarRoot>
      </Tooltip>
    );
  }

  return <div className={cn("-space-x-2 flex", className)}>{childrenShow}</div>;
};
