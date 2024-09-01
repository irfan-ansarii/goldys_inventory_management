CREATE TABLE IF NOT EXISTS "options" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" serial NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipment_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_id" integer,
	"line_item_id" integer,
	"product_id" integer,
	"variant_id" integer,
	"title" text,
	"variant_title" text,
	"image" text,
	"hsn" text,
	"price" numeric,
	"sale_price" numeric,
	"quantity" integer,
	"subtotal" numeric,
	"discount" numeric DEFAULT '0',
	"tax" numeric,
	"total" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"order_id" integer,
	"parent_id" integer,
	"customer_id" integer,
	"shipping" json DEFAULT '{}'::json,
	"subtotal" numeric NOT NULL,
	"discount" numeric DEFAULT '0' NOT NULL,
	"tax" numeric DEFAULT '0' NOT NULL,
	"charges" json DEFAULT '{}'::json,
	"total" numeric NOT NULL,
	"tax_lines" json[] DEFAULT ,
	"mode" text,
	"kind" text,
	"carrier" text,
	"awb" text,
	"status" text,
	"tracking_url" text,
	"label" text,
	"actions" json DEFAULT '[]'::json,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"name" text NOT NULL,
	"supplier_id" integer,
	"source" text[] DEFAULT '{}'::text[],
	"billing" text[] DEFAULT '{}'::text[],
	"subtotal" numeric NOT NULL,
	"discount" numeric DEFAULT '0' NOT NULL,
	"tax" numeric DEFAULT '0' NOT NULL,
	"charges" json DEFAULT '{}'::json,
	"total" numeric NOT NULL,
	"due" numeric DEFAULT '0' NOT NULL,
	"tax_kind" json,
	"tax_lines" json[],
	"discount_lines" json,
	"payment_status" text DEFAULT 'unpaid',
	"notes" text,
	"tags" text[] DEFAULT '{}'::text[],
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"purchase_id" integer,
	"product_id" integer,
	"variant_id" integer,
	"title" text,
	"variant_title" text,
	"image" text,
	"barcode" text,
	"sku" text,
	"hsn" text,
	"price" numeric,
	"purchase_price" numeric,
	"quantity" integer,
	"current_quantity" integer,
	"tax_rate" numeric,
	"subtotal" numeric,
	"discount" numeric DEFAULT '0',
	"tax" numeric,
	"total" numeric,
	"tax_lines" json[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchaseTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer,
	"purchase_id" integer,
	"name" text,
	"kind" text,
	"amount" numeric,
	"payment_id" text,
	"payment_order_id" text,
	"status" text,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "line_items" RENAME COLUMN "discount_kind" TO "image";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "charges_lines" TO "discount";--> statement-breakpoint
ALTER TABLE "adjustments" RENAME COLUMN "product_by" TO "product_id";--> statement-breakpoint
ALTER TABLE "adjustments" DROP CONSTRAINT "adjustments_product_by_products_id_fk";
--> statement-breakpoint
ALTER TABLE "line_items" ALTER COLUMN "tax_lines" SET DEFAULT ;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "billing" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "charges" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "charges" SET DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "charges" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax_lines" SET DEFAULT ;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax_lines" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "discount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "discount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "discount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "notes" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "notes" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "company" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "logo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "address" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "gstin" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "token" text;--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "sale_price" numeric;--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "shipping_quantity" integer;--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "discount" numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "properties" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax_kind" json;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_lines" json;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoice" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tags" text[] DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "additional_meta" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_order_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "options" json[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "options" ADD CONSTRAINT "options_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "options" ADD CONSTRAINT "options_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "options" ADD CONSTRAINT "options_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipment_line_items" ADD CONSTRAINT "shipment_line_items_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipment_line_items" ADD CONSTRAINT "shipment_line_items_line_item_id_line_items_id_fk" FOREIGN KEY ("line_item_id") REFERENCES "public"."line_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipment_line_items" ADD CONSTRAINT "shipment_line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipment_line_items" ADD CONSTRAINT "shipment_line_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase" ADD CONSTRAINT "purchase_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplier_id_users_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase" ADD CONSTRAINT "purchase_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase" ADD CONSTRAINT "purchase_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_line_items" ADD CONSTRAINT "purchase_line_items_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_line_items" ADD CONSTRAINT "purchase_line_items_purchase_id_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_line_items" ADD CONSTRAINT "purchase_line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_line_items" ADD CONSTRAINT "purchase_line_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchaseTransactions" ADD CONSTRAINT "purchaseTransactions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchaseTransactions" ADD CONSTRAINT "purchaseTransactions_purchase_id_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchaseTransactions" ADD CONSTRAINT "purchaseTransactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
