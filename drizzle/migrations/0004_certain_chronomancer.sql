CREATE TABLE IF NOT EXISTS "line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"order_id" integer,
	"product_id" integer,
	"variant_id" integer,
	"title" text,
	"variant_title" text,
	"barcode" text,
	"sku" text,
	"hsn" text,
	"price" numeric,
	"quantity" integer,
	"current_quantity" integer,
	"requires_shipping" boolean DEFAULT false,
	"tax_rate" numeric,
	"subtotal" numeric,
	"tax" numeric,
	"total" numeric,
	"discount_kind" text,
	"tax_lines" json[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"name" text,
	"customer_id" integer,
	"employee_id" integer,
	"billing" text[] DEFAULT ARRAY[]::text[],
	"shipping" text[] DEFAULT ARRAY[]::text[],
	"subtotal" numeric,
	"tax" numeric,
	"charges" numeric DEFAULT '0',
	"total" numeric,
	"due" numeric DEFAULT '0',
	"tax_lines" json[],
	"charges_lines" json[],
	"payment_status" text DEFAULT 'unpaid',
	"shipment_status" text,
	"notes" text[] DEFAULT ARRAY[]::text[],
	"cancel_reason" text,
	"created_by" integer,
	"updated_by" integer,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"order_id" integer,
	"name" text,
	"kind" text,
	"amount" numeric,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_description_unique";--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "hsn" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "line_items" ADD CONSTRAINT "line_items_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "line_items" ADD CONSTRAINT "line_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "line_items" ADD CONSTRAINT "line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "line_items" ADD CONSTRAINT "line_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
