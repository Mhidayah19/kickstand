import { Test, TestingModule } from '@nestjs/testing';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';

describe('BikesController', () => {
  let controller: BikesController;
  const mockBikesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    updateMileage: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikesController],
      providers: [{ provide: BikesService, useValue: mockBikesService }],
    }).compile();
    controller = module.get<BikesController>(BikesController);
  });

  describe('GET /bikes', () => {
    it('should return all bikes for the given userId', async () => {
      const bikes = [{ id: 'bike-1', model: 'Honda CB400X' }];
      mockBikesService.findAllByUser.mockResolvedValue(bikes);
      const result = await controller.findAll('user-1');
      expect(result).toEqual(bikes);
      expect(mockBikesService.findAllByUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('POST /bikes', () => {
    it('should create a bike', async () => {
      const dto = { model: 'Honda CB400X', year: 2023, plateNumber: 'FBA1234X', class: '2A' };
      const bike = { id: 'bike-1', userId: 'user-1', ...dto };
      mockBikesService.create.mockResolvedValue(bike);
      const result = await controller.create('user-1', dto);
      expect(result).toEqual(bike);
      expect(mockBikesService.create).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('PATCH /bikes/:id', () => {
    it('should update a bike', async () => {
      const dto = { model: 'Updated' };
      const updated = { id: 'bike-1', ...dto };
      mockBikesService.update.mockResolvedValue(updated);
      const result = await controller.update('bike-1', 'user-1', dto);
      expect(result).toEqual(updated);
      expect(mockBikesService.update).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('PATCH /bikes/:id/mileage', () => {
    it('should update mileage', async () => {
      const dto = { currentMileage: 16000 };
      const updated = { id: 'bike-1', currentMileage: 16000 };
      mockBikesService.updateMileage.mockResolvedValue(updated);
      const result = await controller.updateMileage('bike-1', 'user-1', dto);
      expect(result).toEqual(updated);
      expect(mockBikesService.updateMileage).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('DELETE /bikes/:id', () => {
    it('should delete a bike', async () => {
      const deleted = { id: 'bike-1' };
      mockBikesService.remove.mockResolvedValue(deleted);
      const result = await controller.remove('bike-1', 'user-1');
      expect(result).toEqual(deleted);
      expect(mockBikesService.remove).toHaveBeenCalledWith('bike-1', 'user-1');
    });
  });
});
