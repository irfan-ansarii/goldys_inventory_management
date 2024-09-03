"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Tooltip from "./custom-ui/tooltip";
import Link from "next/link";
import { useRouterStuff } from "@/hooks/use-router-stuff";

export interface Pagination {
  page: number;
  size: number;
  pages: number;
  total: number;
}

interface PaginationProps {
  meta: Pagination;
}

const Pagination = ({ meta }: PaginationProps) => {
  const { page, size, pages, total } = meta;
  const { queryParams } = useRouterStuff();
  const startItem = (page - 1) * size + 1;
  const endItem = Math.min(page * size, total);

  if (!total || total == 0) return;

  return (
    <Card className="sticky bottom-0 mt-4">
      <div className="flex justify-between gap-4 px-4 md:px-6 py-2 items-center">
        <div className="text-muted-foreground text-sm">
          {`Showing ${startItem} - ${endItem} of ${total}`}
        </div>

        <div className="space-x-2">
          {page === 1 ? (
            <Button size="sm" variant="outline" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Tooltip content="Previous">
              <Link
                href={
                  queryParams({
                    set: { page: `${Math.max(page - 1, 1)}` },
                    getNewPath: true,
                  }) as string
                }
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Tooltip>
          )}

          {/* <span>1</span> */}

          {page === pages ? (
            <Button size="sm" variant="outline" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Tooltip content="Next">
              <Link
                href={
                  queryParams({
                    set: { page: `${Math.min(page + 1, pages)}` },
                    getNewPath: true,
                  }) as string
                }
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "px-",
                })}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Pagination;
