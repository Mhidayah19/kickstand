ALTER TABLE "gemini_usage_logs" RENAME TO "ai_usage_logs";

DROP POLICY "gemini_usage_logs_user_isolation" ON "ai_usage_logs";

CREATE POLICY "ai_usage_logs_user_isolation" ON "ai_usage_logs"
	AS PERMISSIVE
	FOR ALL
	TO authenticated
	USING ((select auth.uid()) = "user_id")
	WITH CHECK ((select auth.uid()) = "user_id");
