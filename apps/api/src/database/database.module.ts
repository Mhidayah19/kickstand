import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

const logger = new Logger('DatabaseModule');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.getOrThrow<string>(
          'SUPABASE_DATABASE_URL',
        );
        const client = postgres(connectionString);
        const db = drizzle(client, { schema });

        // Pre-warm the connection pool so the first real query isn't slow
        const t0 = Date.now();
        await client`SELECT 1`;
        logger.log(`DB connection ready in ${Date.now() - t0}ms`);

        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
