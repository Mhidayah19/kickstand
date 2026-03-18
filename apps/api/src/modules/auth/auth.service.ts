import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async register(dto: RegisterDto) {
    const { email, password, name } = dto;

    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData?.user) {
      throw new BadRequestException(
        authError?.message ?? 'Failed to create user',
      );
    }

    const userId = authData.user.id;

    try {
      await this.db
        .insert(schema.users)
        .values({ id: userId, email, name })
        .returning({
          id: schema.users.id,
          email: schema.users.email,
          name: schema.users.name,
        });
    } catch (dbError) {
      await this.supabase.auth.admin.deleteUser(userId);
      throw dbError;
    }

    const { data: sessionData, error: sessionError } =
      await this.supabase.auth.signInWithPassword({ email, password });

    if (sessionError || !sessionData?.session) {
      throw new UnauthorizedException(
        sessionError?.message ?? 'Failed to sign in after registration',
      );
    }

    return {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_in: sessionData.session.expires_in,
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session) {
      throw new UnauthorizedException(error?.message ?? 'Invalid credentials');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    const { refresh_token } = dto;

    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token,
    });

    if (error || !data?.session) {
      throw new UnauthorizedException(
        error?.message ?? 'Invalid refresh token',
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  }
}
