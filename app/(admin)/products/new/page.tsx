import { Metadata } from "next";
import ProductForm from "../components/product-form";

export const metadata: Metadata = {
  title: "New Product",
};
const NewProductPage = async ({ params }: { params: Record<string, any> }) => {
  return (
    <ProductForm
      defaultValues={{
        title: "",
        description: "",
        type: "simple" as const,
        status: "active" as const,
        image: "",
        options: [{ name: "Default", values: ["Default"] }],
        variants: [],
      }}
    />
  );
};

export default NewProductPage;
