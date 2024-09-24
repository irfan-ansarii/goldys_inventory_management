import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { OrderFormValues } from "./form";
import { useFormContext } from "react-hook-form";
import { useGetVariants } from "@/query/products";
import { Input } from "@/components/ui/input";
import { Pagination as PaginationType } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CustomItemPopup from "./custom-item-popup";
import ProductCard from "./product-card";
import ErrorFallback from "@/components/error-fallback";
import useSearchProduct from "@/hooks/use-search-product";
import SkeletonLoading from "@/components/skeleton-loading";
import Tooltip from "@/components/custom-ui/tooltip";

const ProductsCard = ({ calculateCart }: { calculateCart: () => void }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, isError } = useGetVariants({ q: search, page });

  const { triggerSearch } = useSearchProduct({
    isLoading,
    data: data?.data,
    onComplete: (data) => {
      onSearchComplete(data);
    },
  });

  const form = useFormContext<OrderFormValues>();
  const cartLineItems = form.watch("lineItems");

  // check if item is in cart to show active
  const isItemInCart = (id: number): boolean => {
    return cartLineItems.findIndex((i) => i.variantId === id) !== -1;
  };

  /** hanlde product search */
  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, currentTarget } = e;
    const { value } = currentTarget;

    if (key !== "Enter" || !value) return;
    triggerSearch();
  };

  const onSearchComplete = (items: any) => {
    if (!items) return;
    const item = items[0];

    const index = cartLineItems.findIndex((inv) => inv.variantId === item.id);

    const p = cartLineItems[index];

    if (index >= 0) {
      cartLineItems[index] = {
        ...p,
        currentQuantity: p.currentQuantity! + 1,
      };
    } else {
      cartLineItems.push({
        variantId: item.id,
        productId: item.product.id,
        title: item.product.title,
        variantTitle: item.title,
        image: item.product.image,
        barcode: item.barcode,
        hsn: item.hsn,
        price: item.salePrice,
        salePrice: item.salePrice,
        currentQuantity: 1,
        taxRate: item.taxRate,
        subtotal: "",
        discount: "",
        tax: "",
        total: "",
        taxLines: [],
        discountLine: {
          type: "fixed",
          amount: "",
        },
      });
    }
    form.setValue("lineItems", cartLineItems);
    calculateCart();
    setSearch("");
  };

  useEffect(() => {
    console.log("focusing");
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {/* search bar */}
      <div className="sticky top-[4.5rem] lg:top-6 z-10">
        <div className="relative">
          <span className="absolute left-0 inset-y-0 px-3 pointer-events-none inline-flex items-center justify-center">
            <Search className="w-4 h-4" />
          </span>
          <Input
            ref={inputRef}
            placeholder="Scan | Search..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          {/* custom item popup */}
          <CustomItemPopup calculateCart={calculateCart} />
        </div>
      </div>

      {/* products */}
      <div className="flex-1 space-y-2">
        {isLoading ? (
          <SkeletonLoading />
        ) : isError ? (
          <ErrorFallback />
        ) : (
          data?.data?.map((variant, i) => (
            <ProductCard
              key={i}
              variant={variant}
              isActive={isItemInCart(variant.id)}
              calculateCart={calculateCart}
            />
          ))
        )}
      </div>
      {/* pagination */}
      {data && <Pagination meta={data.meta} onChange={setPage} />}
    </>
  );
};

export default ProductsCard;

interface PaginationProps {
  meta: PaginationType;
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
