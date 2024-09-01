ALTER TABLE "variants" DROP CONSTRAINT "variants_sku_unique";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "store_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "subtotal" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "charges" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "total" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "due" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax_lines" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "options" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "hsn" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "purchase_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "sale_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "tax_rate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;