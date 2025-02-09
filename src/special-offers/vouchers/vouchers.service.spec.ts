/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from '../../entities/customer.entity';
import { SpecialOffer } from '../../entities/special-offer.entity';
import { Voucher } from '../../entities/voucher.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VouchersService', () => {
  let service: VouchersService;
  let voucherRepo: Repository<Voucher>;
  let customerRepo: Repository<Customer>;
  let specialOfferRepo: Repository<SpecialOffer>;

  const mockVouchersRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockCustomerRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockSpecialOfferRepo = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          setLock: jest.fn().mockReturnThis(),
          getOne: jest.fn(),
          save: jest.fn(),
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          execute: jest.fn(),
          orIgnore: jest.fn().mockReturnThis(),
        }),
        where: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        save: jest.fn(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn(),
        orIgnore: jest.fn().mockReturnThis(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: getRepositoryToken(Customer), useValue: mockCustomerRepo },
        {
          provide: getRepositoryToken(SpecialOffer),
          useValue: mockSpecialOfferRepo,
        },
        { provide: getRepositoryToken(Voucher), useValue: mockVouchersRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
    voucherRepo = module.get<Repository<Voucher>>(getRepositoryToken(Voucher));
    customerRepo = module.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    specialOfferRepo = module.get<Repository<SpecialOffer>>(
      getRepositoryToken(SpecialOffer),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmailPaginated()', () => {
    it('should return paginated vouchers for a given email', async () => {
      mockVouchersRepo.findAndCount.mockResolvedValue([
        [{ id: 1, code: 'ABC123' }],
        1,
      ]);

      const result = await service.findByEmailPaginated('test@example.com');

      expect(result).toEqual({
        data: [{ id: 1, code: 'ABC123' }],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockVouchersRepo.findAndCount).toHaveBeenCalledWith({
        where: { customer: { email: 'test@example.com' } },
        relations: ['specialOffer', 'customer'],
        take: 10,
        skip: 0,
      });
    });
  });

  describe('generateVoucher()', () => {
    it('should generate vouchers for all customers', async () => {
      const mockCustomers = [{ id: 1, email: 'user1@example.com' }];
      mockCustomerRepo.find.mockResolvedValue(mockCustomers);
      mockSpecialOfferRepo.findOne.mockResolvedValue({
        id: '1',
        name: 'Discount',
        discountPercentage: 10,
      });
      mockVouchersRepo.findOne.mockResolvedValue(null);
      mockVouchersRepo.create.mockImplementation((voucher: Voucher) => voucher);
      mockVouchersRepo.save.mockResolvedValue({ id: 1, code: 'XYZ123' });
      mockVouchersRepo.find.mockResolvedValue([
        { id: 1, code: 'XYZ123', customer: mockCustomers[0] },
      ]);

      const result = await service.generateVoucher('1', '2025-01-01');

      expect(result).toHaveLength(1);
    });

    it('should generate vouchers successfully', async () => {
      const offerId = '1';
      const expiration = '2025-12-31';

      const specialOffer = { id: offerId } as SpecialOffer;
      const customers = [
        { id: 'c1', email: 'customer1@example.com' },
        { id: 'c2', email: 'customer2@example.com' },
      ] as Customer[];

      mockSpecialOfferRepo.findOne.mockResolvedValue(specialOffer);
      mockCustomerRepo.find.mockResolvedValue(customers);
      mockVouchersRepo.find.mockResolvedValue([
        { id: 1, code: 'XYZ123', customer: customers[0] },
        { id: 2, code: 'ABC456', customer: customers[1] },
      ]);

      const result = await service.generateVoucher(offerId, expiration);

      expect(result).toBeDefined();
      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(result.length).toBe(customers.length);
    });

    it('should return an empty array if no customers are found', async () => {
      mockCustomerRepo.find.mockResolvedValue([]);

      const result = await service.generateVoucher('1', '2025-01-01');

      expect(result).toHaveLength(0);
    });

    it('should throw an error if the offer is not found', async () => {
      mockSpecialOfferRepo.findOne.mockResolvedValue(null);

      await expect(service.generateVoucher('1', '2025-01-01')).rejects.toThrow(
        'Special offer not found',
      );
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const offerId = '1';

      const specialOffer = { id: offerId } as SpecialOffer;
      const customers = [
        { id: 'c1', email: 'customer1@example.com' },
        { id: 'c2', email: 'customer2@example.com' },
      ] as Customer[];

      mockSpecialOfferRepo.findOne.mockResolvedValue(specialOffer);
      mockCustomerRepo.find.mockResolvedValue(customers);
      mockVouchersRepo.find.mockResolvedValue([
        { id: 1, code: 'XYZ123', customer: customers[0] },
        { id: 2, code: 'ABC456', customer: customers[1] },
      ]);

      mockDataSource
        .createQueryRunner()
        .manager.createQueryBuilder()
        .execute.mockRejectedValue(new Error('Failed to generate - Db error'));
      await expect(service.generateVoucher('1', '2025-01-01')).rejects.toThrow(
        'Failed to generate vouchers',
      );
    });
  });

  describe('redeemVoucher()', () => {
    it('should successfully redeem a valid voucher', async () => {
      const mockVoucher = {
        id: 1,
        code: 'VALID123',
        customer: { email: 'test@example.com' },
        specialOffer: { discountPercentage: 20 },
        redeemedAt: null,
        expirationDate: new Date(Date.now() + 100000), // Future expiry
      };
      mockDataSource.createQueryRunner().manager.createQueryBuilder().getOne =
        jest.fn().mockResolvedValue(mockVoucher);

      mockDataSource
        .createQueryRunner()
        .manager.getOne.mockResolvedValue(mockVoucher);
      mockDataSource
        .createQueryRunner()
        .manager.save.mockResolvedValue(mockVoucher);

      const discount = await service.redeemVoucher(
        'VALID123',
        'test@example.com',
      );

      expect(discount).toBe(20);
      expect(
        mockDataSource.createQueryRunner().manager.save,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if voucher does not exist', async () => {
      mockDataSource.createQueryRunner().manager.createQueryBuilder().getOne =
        jest.fn().mockResolvedValue(null);

      await expect(
        service.redeemVoucher('INVALID123', 'test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if voucher is already redeemed', async () => {
      const redeemedVoucher = {
        id: 1,
        code: 'USED123',
        customer: { email: 'test@example.com' },
        specialOffer: { discountPercentage: 15 },
        redeemedAt: new Date(),
        expirationDate: new Date(Date.now() + 100000),
      };

      mockDataSource.createQueryRunner().manager.createQueryBuilder().getOne =
        jest.fn().mockResolvedValue(redeemedVoucher);

      await expect(
        service.redeemVoucher('USED123', 'test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if voucher is expired', async () => {
      const expiredVoucher = {
        id: 1,
        code: 'EXPIRED123',
        customer: { email: 'test@example.com' },
        specialOffer: { discountPercentage: 10 },
        redeemedAt: null,
        expirationDate: new Date(Date.now() - 100000), // Expired date
      };

      mockDataSource
        .createQueryRunner()
        .manager.createQueryBuilder()
        .getOne.mockResolvedValue(expiredVoucher);

      await expect(
        service.redeemVoucher('EXPIRED123', 'test@example.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
