ALTER TABLE "inventory" ALTER COLUMN "store_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "variant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_name";