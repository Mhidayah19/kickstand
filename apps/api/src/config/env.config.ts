export const envConfig = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    databaseUrl: process.env.SUPABASE_DATABASE_URL,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  scanApiKey: process.env.SCAN_API_KEY,
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    globalRpm: parseInt(process.env.OPENAI_GLOBAL_RPM ?? '10', 10),
    perUserDailyCap: parseInt(
      process.env.OPENAI_PER_USER_DAILY_CAP ?? '50',
      10,
    ),
    confidenceFloor: parseFloat(process.env.OPENAI_CONFIDENCE_FLOOR ?? '0.5'),
  },
  googlePlaces: {
    apiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
  },
});
