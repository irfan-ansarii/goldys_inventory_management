"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Tooltip from "./custom-ui/tooltip";

export interface Pagination {
  page: number;
  size: number;
  pages: number;
  total: number;
}

interface PaginationProps {
  meta: Pagination;
  onChange: (p: number) => void;
}

const Pagination = ({ meta, onChange }: PaginationProps) => {
  const { page, size, pages, total } = meta;

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
              <Button
                onClick={() => onChange(Math.max(page - 1, 1))}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {/* <span>1</span> */}

          {page === pages ? (
            <Button size="sm" variant="outline" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Tooltip content="Next">
              <Button
                onClick={() => onChange(Math.min(page + 1, pages))}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Pagination;
