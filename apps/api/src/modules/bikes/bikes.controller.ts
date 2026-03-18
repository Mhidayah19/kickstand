import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';

// TODO: Task 10 will replace @Headers('x-user-id') with @UseGuards(SupabaseAuthGuard) + @CurrentUser()
@Controller('bikes')
export class BikesController {
  constructor(private bikesService: BikesService) {}

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.bikesService.findAllByUser(userId);
  }

  @Post()
  create(@Headers('x-user-id') userId: string, @Body() dto: CreateBikeDto) {
    return this.bikesService.create(userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-user-id') userId: string, @Body() dto: UpdateBikeDto) {
    return this.bikesService.update(id, userId, dto);
  }

  @Patch(':id/mileage')
  updateMileage(@Param('id') id: string, @Headers('x-user-id') userId: string, @Body() dto: UpdateMileageDto) {
    return this.bikesService.updateMileage(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.bikesService.remove(id, userId);
  }
}
