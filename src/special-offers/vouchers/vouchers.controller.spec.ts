import { Test, TestingModule } from '@nestjs/testing';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { CustomersService } from '../../customers/customers/customers.service';
import { SpecialOffersService } from '../special-offers/special-offers.service';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FilterQueryDto } from '../../dto/query.dto';

describe('VouchersController', () => {
  let controller: VouchersController;

  const mockVouchersService = {
    findWithFilterPaginated: jest.fn(),
    findByEmailPaginated: jest.fn(),
    generateVoucher: jest.fn(),
    redeemVoucher: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VouchersController],
      providers: [
        { provide: VouchersService, useValue: mockVouchersService },
        { provide: CustomersService, useValue: {} }, // Mock unused dependencies
        { provide: SpecialOffersService, useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    controller = module.get<VouchersController>(VouchersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return paginated vouchers with filters', async () => {
      const mockVouchers = [{ id: 1, code: 'ABC123' }];
      mockVouchersService.findWithFilterPaginated.mockResolvedValue(
        mockVouchers,
      );

      const result = await controller.findAll({ limit: 10, page: 1 }, {
        email: 'test@example.com',
      } as FilterQueryDto);

      expect(result).toEqual(mockVouchers);
      expect(mockVouchersService.findWithFilterPaginated).toHaveBeenCalledWith(
        { customer: { email: 'test@example.com' } },
        10,
        1,
      );
    });
  });

  describe('findByEmail()', () => {
    it('should return vouchers for a given email', async () => {
      const mockVouchers = [{ id: 1, code: 'XYZ789' }];
      mockVouchersService.findByEmailPaginated.mockResolvedValue(mockVouchers);

      const result = await controller.findByEmail(
        { email: 'test@example.com' },
        {
          limit: 5,
          page: 1,
        },
      );

      expect(result).toEqual(mockVouchers);
      expect(mockVouchersService.findByEmailPaginated).toHaveBeenCalledWith(
        'test@example.com',
        5,
        1,
      );
    });

    it('should return vouchers with default pagination', async () => {
      const mockVouchers = [{ id: 1, code: 'XYZ789' }];
      mockVouchersService.findByEmailPaginated.mockResolvedValue(mockVouchers);

      const result = await controller.findByEmail(
        { email: 'test@example.co' },
        { limit: 10, page: 1 },
      );

      expect(result).toEqual(mockVouchers);
      expect(mockVouchersService.findByEmailPaginated).toHaveBeenCalledWith(
        'test@example.co',
        10,
        1,
      );
    });
  });

  describe('create()', () => {
    it('should create a voucher', async () => {
      const mockVoucher = { id: 1, code: 'NEWCODE' };
      mockVouchersService.generateVoucher.mockResolvedValue(mockVoucher);

      const result = await controller.create({
        offerId: '1',
        expirationDate: new Date().toDateString(),
      });

      expect(result).toEqual(mockVoucher);
      expect(mockVouchersService.generateVoucher).toHaveBeenCalled();
    });
  });

  describe('redeemVoucher()', () => {
    it('should redeem a valid voucher', async () => {
      mockVouchersService.redeemVoucher.mockResolvedValue(10); // Mock returning a 10% discount

      const result = await controller.redeemVoucher({
        code: 'ABC123',
        email: 'user@example.com',
      });

      expect(result).toEqual({ discount: 10 });
      expect(mockVouchersService.redeemVoucher).toHaveBeenCalledWith(
        'ABC123',
        'user@example.com',
      );
    });

    it('should throw NotFoundException if voucher is invalid', async () => {
      mockVouchersService.redeemVoucher.mockResolvedValue(null);

      await expect(
        controller.redeemVoucher({
          code: 'INVALID',
          email: 'user@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
