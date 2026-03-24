import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly knownUsers = new Set<string>();

  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    this.jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn({ url: request.url }, 'Missing authorization token');
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        algorithms: ['ES256'],
      });

      const id = payload.sub as string;
      const email = payload.email as string;

      await this.ensureUserExists(id, email);

      (request as unknown as Record<string, unknown>)['user'] = { id, email };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      const message =
        err instanceof Error ? err.message : 'Unknown verification error';
      this.logger.warn(
        { url: request.url, reason: message },
        'Invalid or expired token',
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async ensureUserExists(id: string, email: string): Promise<void> {
    if (this.knownUsers.has(id)) return;

    await this.db
      .insert(schema.users)
      .values({ id, email, name: email.split('@')[0] })
      .onConflictDoNothing({ target: schema.users.id });

    this.knownUsers.add(id);
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
