ALTER TABLE "workshops" ADD COLUMN "google_place_id" text;
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_google_place_id_unique" UNIQUE("google_place_id");
