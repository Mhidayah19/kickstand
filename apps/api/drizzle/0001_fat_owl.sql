CREATE TABLE "bike_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"engine_cc" integer,
	"bike_type" text NOT NULL,
	"license_class" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bike_catalog_make_model_unique" UNIQUE("make","model")
);
--> statement-breakpoint
ALTER TABLE "bikes" ADD COLUMN "make" text;--> statement-breakpoint
ALTER TABLE "bikes" ADD COLUMN "engine_cc" integer;--> statement-breakpoint
ALTER TABLE "bikes" ADD COLUMN "bike_type" text;--> statement-breakpoint
ALTER TABLE "bikes" ADD COLUMN "catalog_id" uuid;--> statement-breakpoint
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_catalog_id_bike_catalog_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."bike_catalog"("id") ON DELETE no action ON UPDATE no action;