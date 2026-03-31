import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { DRIZZLE } from '../../database/database.module';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };
  const mockUser: AuthUser = { id: 'user-1', email: 'test@example.com' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: DRIZZLE, useValue: {} },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<UsersController>(UsersController);
  });

  describe('GET /users/me', () => {
    it('should return profile for authenticated user', async () => {
      const profile = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        createdAt: new Date(),
        bikeCount: 2,
      };
      mockUsersService.getProfile.mockResolvedValue(profile);
      const result = await controller.getProfile(mockUser);
      expect(result).toEqual(profile);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('PATCH /users/me', () => {
    it('should update profile for authenticated user', async () => {
      const dto = { name: 'Updated' };
      const updated = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Updated',
        createdAt: new Date(),
        bikeCount: 2,
      };
      mockUsersService.updateProfile.mockResolvedValue(updated);
      const result = await controller.updateProfile(mockUser, dto);
      expect(result).toEqual(updated);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        dto,
      );
    });
  });
});
