import { getProduct } from "@/query/products";

import EditForm from "../components/edit-form";

const NewProductPage = async ({ params }: { params: Record<string, any> }) => {
  const { id } = params;

  const { data: product } = await getProduct(id);

  const defaultVariants = product.variants.map((v) => ({
    ...v,
    variantId: v.id,
  }));

  return (
    <EditForm
      defaultValues={{ ...product, variants: defaultVariants }}
      id={product.id}
    />
  );
};

export default NewProductPage;
