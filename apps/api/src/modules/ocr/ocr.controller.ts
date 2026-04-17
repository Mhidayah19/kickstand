import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OcrService } from './ocr.service';
import { OcrRequestDto } from './dto/ocr-request.dto';

@Controller('service-logs/ocr')
export class OcrController {
  private readonly logger = new Logger(OcrController.name);

  constructor(private readonly ocr: OcrService) {}

  @Post()
  run(@CurrentUser() user: AuthUser, @Body() dto: OcrRequestDto) {
    this.logger.log(`POST /service-logs/ocr — userId: ${user?.id}, receiptUrl: ${dto?.receiptUrl}`);
    return this.ocr.extract(user.id, dto.receiptUrl);
  }
}
