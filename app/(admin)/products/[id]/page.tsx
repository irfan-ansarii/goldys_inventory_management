import { Metadata } from "next";
import { getProduct } from "@/query/products";
import ProductForm from "../components/product-form";

export const metadata: Metadata = {
  title: "Edit Product",
};
const EditProductPage = async ({ params }: { params: Record<string, any> }) => {
  const { id } = params;

  const { data: product } = await getProduct(id);

  const defaultVariants = product.variants.map((v) => ({
    ...v,
    variantId: v.id,
  }));

  return (
    <ProductForm
      defaultValues={{ ...product, variants: defaultVariants }}
      id={product.id}
    />
  );
};

export default EditProductPage;
