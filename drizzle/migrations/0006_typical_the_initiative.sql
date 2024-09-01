ALTER TABLE "inventory" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "updated_at" SET NOT NULL;