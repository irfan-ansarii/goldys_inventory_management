ALTER TABLE "barcodes" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "barcodes" DROP COLUMN IF EXISTS "reason";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "image_url";