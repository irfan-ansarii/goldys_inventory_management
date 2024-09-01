import React from "react";
import ProductCard from "../components/product-card";
import Pagination from "@/components/pagination";
import { getProducts } from "@/query/products";
import { Metadata } from "next";
import NoDataFallback from "@/components/nodata-fallback";

export const metadata: Metadata = {
  title: "Products",
};
const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { data, meta } = await getProducts(searchParams);

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default ProductsPage;
