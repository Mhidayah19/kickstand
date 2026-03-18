import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';

@Controller('bikes')
@UseGuards(SupabaseAuthGuard)
export class BikesController {
  constructor(private bikesService: BikesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.bikesService.findAllByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBikeDto) {
    return this.bikesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBikeDto,
  ) {
    return this.bikesService.update(id, user.id, dto);
  }

  @Patch(':id/mileage')
  updateMileage(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMileageDto,
  ) {
    return this.bikesService.updateMileage(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bikesService.remove(id, user.id);
  }
}
