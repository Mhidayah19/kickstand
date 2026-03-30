ALTER TABLE "agent_conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bikes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bike_catalog" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "service_logs" ADD COLUMN "parts" jsonb;--> statement-breakpoint
CREATE POLICY "agent_conversations_user_isolation" ON "agent_conversations" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "agent_conversations"."user_id") WITH CHECK ((select auth.uid()) = "agent_conversations"."user_id");--> statement-breakpoint
CREATE POLICY "bikes_user_isolation" ON "bikes" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "bikes"."user_id") WITH CHECK ((select auth.uid()) = "bikes"."user_id");--> statement-breakpoint
CREATE POLICY "notification_logs_user_isolation" ON "notification_logs" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "notification_logs"."user_id") WITH CHECK ((select auth.uid()) = "notification_logs"."user_id");--> statement-breakpoint
CREATE POLICY "service_logs_user_isolation" ON "service_logs" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM bikes WHERE bikes.id = "service_logs"."bike_id" AND bikes.user_id = (select auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM bikes WHERE bikes.id = "service_logs"."bike_id" AND bikes.user_id = (select auth.uid())));