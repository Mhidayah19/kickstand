import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly knownUsers = new Set<string>();
  private readonly supabaseIssuer: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    this.supabaseIssuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.supabaseIssuer}/.well-known/jwks.json`),
    );
  }

  async onModuleInit() {
    try {
      await jwtVerify('warmup', this.jwks, { algorithms: ['ES256'] });
    } catch {
      // Expected — we just need the JWKS fetch to happen
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn({ url: request.url }, 'Missing authorization token');
      throw new UnauthorizedException('Missing authorization token');
    }

    let id: string;
    let email: string;

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        algorithms: ['ES256'],
        audience: 'authenticated',
        issuer: this.supabaseIssuer,
      });

      if (payload.role !== 'authenticated') {
        // Defense-in-depth: validates role claim separately from aud claim,
        // guarding against any Supabase token where aud and role could diverge
        // (e.g., service_role tokens that have aud='authenticated' misconfigured)
        throw new UnauthorizedException('Invalid token role');
      }

      if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new UnauthorizedException('Token missing subject');
      }
      if (typeof payload.email !== 'string' || !payload.email) {
        throw new UnauthorizedException('Token missing email claim');
      }

      id = payload.sub;
      email = payload.email;
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

    await this.ensureUserExists(id, email);
    Sentry.getCurrentScope().setUser({ id, email });
    (request as unknown as Record<string, unknown>)['user'] = { id, email };
    return true;
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
