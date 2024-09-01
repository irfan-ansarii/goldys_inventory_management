import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Product",
};
const NewProduct = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default NewProduct;
