/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DRIZZLE } from '../../database/database.module';

const mockDb: any = {};
const createChainMethod = () => jest.fn(() => mockDb);

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    // Reset/setup chain methods - create new jest.fn instances each time
    Object.assign(mockDb, {
      select: createChainMethod(),
      from: createChainMethod(),
      where: createChainMethod(),
      leftJoin: createChainMethod(),
      update: createChainMethod(),
      set: createChainMethod(),
      returning: createChainMethod(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: DRIZZLE, useValue: mockDb }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return user profile with bike count', async () => {
      const userId = 'user-uuid-1';
      const userRow = {
        id: userId,
        email: 'rider@example.com',
        name: 'Alex',
        createdAt: new Date('2025-01-01'),
      };

      mockDb.where.mockResolvedValueOnce([userRow]);
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);

      const result = await service.getProfile(userId);

      expect(result).toEqual({
        id: userId,
        email: 'rider@example.com',
        name: 'Alex',
        createdAt: userRow.createdAt,
        bikeCount: 2,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user name and return updated profile', async () => {
      const userId = 'user-uuid-1';
      const updatedUser = {
        id: userId,
        email: 'rider@example.com',
        name: 'Alex Updated',
        createdAt: new Date('2025-01-01'),
      };

      // update().set().where().returning() chain
      mockDb.returning.mockResolvedValueOnce([{ id: userId }]);
      mockDb.where.mockImplementationOnce(() => mockDb);
      // getProfile: user query + bike count query (Promise.all)
      mockDb.where.mockResolvedValueOnce([updatedUser]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await service.updateProfile(userId, {
        name: 'Alex Updated',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual({
        id: userId,
        email: 'rider@example.com',
        name: 'Alex Updated',
        createdAt: updatedUser.createdAt,
        bikeCount: 1,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // update().set().where().returning() returns empty
      mockDb.returning.mockResolvedValueOnce([]);
      mockDb.where.mockImplementationOnce(() => mockDb);

      await expect(
        service.updateProfile('nonexistent', { name: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
