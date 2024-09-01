import bwipjs from "bwip-js";
import jsPDF from "jspdf";
import { truncatePdfText } from "@/app/api/utils";
import { getOption } from "./options";

type LabelConfig = Record<string, number>;
type LabelItem = {
  id: number;
  barcode: string;
  options: Record<string, string>[] | null;
  title: string;
  price: number;
};

/**
 * get barcode config
 * @returns
 */
export const getBarcodeConfig = async () => {
  const config = await getOption("barcode");
  const jsonConfig = JSON.parse(config.value);

  const width = parseInt(jsonConfig.width);
  const height = parseInt(jsonConfig.height);
  const columns = parseInt(jsonConfig.columns);
  const gap = parseInt(jsonConfig.gap);
  const top = parseInt(jsonConfig.top);
  const bottom = parseInt(jsonConfig.bottom);
  const left = parseInt(jsonConfig.left);
  const right = parseInt(jsonConfig.right);

  return { width, height, columns, gap, top, bottom, left, right };
};

/**
 * initialize pdf
 * @param config
 * @returns
 */
export function initializePdf(config: LabelConfig) {
  return new jsPDF({
    orientation: "l",
    unit: "mm",
    format: [config.width, config.height],
  });
}

/**
 * render barcode and info on column
 * @param doc
 * @param barcodeconfig
 * @param labelItem
 * @param x
 * @param y
 * @returns
 */
export async function drawBarcode(
  doc: jsPDF,
  config: LabelConfig,
  labelItem: LabelItem,
  x: number,
  y: number
) {
  const { width, height, columns, gap, bottom, left, right } = config;
  const { barcode, title, price, options = [] } = labelItem;

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");

  /** draw barcode */
  const barcodeconfig = {
    bcid: "code128",
    text: barcode,
    scale: 5,
    height: 10,
  };

  const generatedBarcode = await bwipjs.toBuffer(barcodeconfig);

  const barcodeWidth = (width - gap * (columns - 1)) / columns - (left + right);

  doc.addImage(generatedBarcode, x, y, barcodeWidth, 8);

  y += 10;

  /** calculate barcode characters width */
  let charX = x;
  const totalWidth = Array.from(barcode).reduce((acc, curr) => {
    const { w } = doc.getTextDimensions(curr);
    acc += w;
    return acc;
  }, 0) as number;

  /** draw barcode characters */
  const space = (barcodeWidth - totalWidth) / (barcode.length - 1);

  Array.from(barcode).forEach((item) => {
    const { w } = doc.getTextDimensions(item);
    doc.text(item, charX, y);
    charX += w + space;
  });

  /** draw product title */
  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  const w = doc.getTextWidth(title);
  const finalText = truncatePdfText(title, barcodeWidth, w);
  doc.text(finalText, x, y);

  /** draw product options */
  doc.setFont("helvetica", "normal");
  y += 3.5;

  options?.forEach((opt) => {
    const textWidth = doc.getTextWidth(opt?.name);
    doc.text(`${opt?.name}:`, x, y);
    doc.text(opt?.value, x + textWidth + 2, y);

    y += 3.5;
  });

  /** draw price */
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const priceWidth = doc.getTextWidth(price?.toFixed(2));
  x += barcodeWidth - priceWidth;
  doc.text(price?.toFixed(2), x, height - bottom);

  /** draw price symbol !!INR */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("INR", x - 4.5, height - bottom);

  return y;
}

/**
 *  generate barcode
 * @param list
 */
export const generateBarcode = async (
  doc: jsPDF,
  config: LabelConfig,
  list: LabelItem[]
) => {
  const { width, height, columns, gap, top, left } = config;

  const ids = [] as number[];

  for (let j = 0; j < list.length; j += columns) {
    if (j > 0) {
      doc.addPage();
    }

    for (let i = 0; i < columns; i++) {
      const labelIndex = j + i;

      if (labelIndex < list.length) {
        const labelItem = list[labelIndex];
        const columnWidth = (width - gap * (columns - 1)) / columns;

        const x = i * (columnWidth + gap);

        await drawBarcode(doc, config, labelItem, x + left, top);

        ids.push(labelItem.id);
      }
    }
  }

  return ids;
};
