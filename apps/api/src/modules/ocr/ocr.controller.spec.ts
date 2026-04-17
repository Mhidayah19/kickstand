import { Test } from '@nestjs/testing';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

describe('OcrController', () => {
  let controller: OcrController;
  let extract: jest.Mock;

  beforeEach(async () => {
    extract = jest.fn();
    const moduleRef = await Test.createTestingModule({
      controllers: [OcrController],
      providers: [{ provide: OcrService, useValue: { extract } }],
    }).compile();
    controller = moduleRef.get(OcrController);
  });

  it('delegates to OcrService.extract with the user id and receipt url', async () => {
    const fake = {
      cacheHit: false,
      receiptUrl: 'u',
      fields: {},
      workshopId: null,
    };
    extract.mockResolvedValue(fake);
    const user = { id: 'user-1' } as AuthUser;

    const result = await controller.run(user, {
      receiptUrl: 'https://x.test/a.jpg',
    });

    expect(extract).toHaveBeenCalledWith('user-1', 'https://x.test/a.jpg');
    expect(result).toBe(fake);
  });

  it('surfaces service errors to the caller', async () => {
    extract.mockRejectedValue(new Error('upstream down'));
    const user = { id: 'user-2' } as AuthUser;

    await expect(
      controller.run(user, { receiptUrl: 'https://x.test/b.jpg' }),
    ).rejects.toThrow('upstream down');
  });
});
