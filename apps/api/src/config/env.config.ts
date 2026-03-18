export const envConfig = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    databaseUrl: process.env.SUPABASE_DATABASE_URL,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  scanApiKey: process.env.SCAN_API_KEY,
});
