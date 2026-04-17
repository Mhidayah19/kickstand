CREATE TABLE "ocr_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"image_hash" text NOT NULL,
	"fields" jsonb NOT NULL,
	"receipt_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ocr_cache_user_hash_unique" UNIQUE("user_id","image_hash"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
);

CREATE POLICY "ocr_cache_user_isolation" ON "ocr_cache"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((select auth.uid()) = "user_id")
	WITH CHECK ((select auth.uid()) = "user_id");

CREATE TABLE "gemini_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model" text NOT NULL,
	"tokens_in" integer NOT NULL,
	"tokens_out" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
);

CREATE POLICY "gemini_usage_logs_user_isolation" ON "gemini_usage_logs"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((select auth.uid()) = "user_id")
	WITH CHECK ((select auth.uid()) = "user_id");
