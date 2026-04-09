import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { AttentionService } from './attention.service';

@Controller('bikes/:bikeId/attention')
@UseGuards(SupabaseAuthGuard)
export class AttentionController {
  constructor(private readonly attentionService: AttentionService) {}

  @Get()
  getAttention(@CurrentUser() user: AuthUser, @Param('bikeId') bikeId: string) {
    return this.attentionService.getForBike(bikeId, user.id);
  }
}
