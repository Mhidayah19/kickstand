import { Test, TestingModule } from '@nestjs/testing';
import { AttentionController } from './attention.controller';
import { AttentionService } from './attention.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

describe('AttentionController', () => {
  let controller: AttentionController;
  const mockService = {
    getForBike: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttentionController],
      providers: [{ provide: AttentionService, useValue: mockService }],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AttentionController);
  });

  it('delegates to AttentionService with bikeId and userId', async () => {
    const expected = {
      bike: { id: 'b1', model: 'CB400X', currentMileage: 0 },
      summary: {
        total: 0,
        needsAttention: 0,
        overdue: 0,
        approaching: 0,
        ok: 0,
      },
      items: [],
    };
    mockService.getForBike.mockResolvedValue(expected);

    const result = await controller.getAttention(
      { id: 'user-1', email: 'test@example.com' } as AuthUser,
      'b1',
    );

    expect(mockService.getForBike).toHaveBeenCalledWith('b1', 'user-1');
    expect(result).toBe(expected);
  });
});
