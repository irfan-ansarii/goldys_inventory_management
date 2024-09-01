"use server";

import { getOption } from "@/query/options";

export const getBarcodeConfig = async () => {
  const { data } = await getOption("barcode");

  const width = parseInt(data.width);
  const height = parseInt(data.height);
  const columns = parseInt(data.columns);
  const gap = parseInt(data.gap);
  const top = parseInt(data.top);
  const bottom = parseInt(data.bottom);
  const left = parseInt(data.left);
  const right = parseInt(data.right);

  return { width, height, columns, gap, top, bottom, left, right };
};
