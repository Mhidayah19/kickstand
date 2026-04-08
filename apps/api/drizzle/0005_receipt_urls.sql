ALTER TABLE "service_logs" ADD COLUMN "receipt_urls" text[] NOT NULL DEFAULT '{}';
UPDATE "service_logs" SET "receipt_urls" = ARRAY["receipt_url"] WHERE "receipt_url" IS NOT NULL;
ALTER TABLE "service_logs" DROP COLUMN "receipt_url";
