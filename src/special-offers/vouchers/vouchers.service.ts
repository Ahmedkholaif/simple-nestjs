import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Voucher } from '../../entities/voucher.entity';
import { Customer } from '../../entities/customer.entity';
import { SpecialOffer } from '../../entities/special-offer.entity';
import ShortUniqueId from 'short-unique-id';
import { PaginationResponseDto } from '../../dto/query.dto';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher) private voucherRepo: Repository<Voucher>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(SpecialOffer)
    private specialOfferRepo: Repository<SpecialOffer>,
    private dataSource: DataSource,
  ) {}

  async findByEmailPaginated(
    email: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<PaginationResponseDto<Voucher>> {
    const vouchers = await this.voucherRepo.findAndCount({
      where: { customer: { email } },
      relations: ['specialOffer', 'customer'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: vouchers[0],
      total: vouchers[1],
      page,
      limit,
    };
  }

  async findWithFilterPaginated(
    filter: Record<string, any>,
    limit: number = 10,
    page: number = 1,
  ): Promise<PaginationResponseDto<Voucher>> {
    const vouchers = await this.voucherRepo.findAndCount({
      where: filter,
      relations: ['specialOffer', 'customer'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: vouchers[0],
      total: vouchers[1],
      page,
      limit,
    };
  }

  async generateVoucher(
    offerId: string,
    expiration: string,
  ): Promise<Voucher[]> {
    const specialOffer = await this.specialOfferRepo.findOne({
      where: { id: offerId },
    });
    if (!specialOffer) throw new NotFoundException('Special offer not found');

    const customers = await this.customerRepo.find();

    if (customers.length === 0) {
      return [];
    }

    const uid = new ShortUniqueId({ length: 8 });
    const vouchers: Partial<Voucher>[] = customers.map((customer) => ({
      code: uid.rnd(),
      customer,
      specialOffer,
      expirationDate: new Date(new Date(expiration).toUTCString()),
      redeemedAt: null,
    }));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Voucher)
        .values(vouchers)
        .orIgnore() // Ignore duplicates - in case of unique constraint violation (customer, specialOffer)
        .execute();

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Failed to generate vouchers:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to generate vouchers');
    } finally {
      await queryRunner.release();
    }

    return await this.voucherRepo.find({
      where: { specialOffer: { id: offerId } },
      relations: ['customer', 'specialOffer'],
    });
  }

  async redeemVoucher(code: string, email: string): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const voucher = await queryRunner.manager
        .createQueryBuilder(Voucher, 'voucher')
        .innerJoinAndSelect('voucher.customer', 'customer')
        .innerJoinAndSelect('voucher.specialOffer', 'specialOffer')
        .where('voucher.code = :code', { code })
        .setLock('pessimistic_write')
        .getOne();

      if (!voucher || voucher.redeemedAt || voucher.customer.email !== email) {
        throw new NotFoundException('Voucher does not exist');
      }

      if (voucher.expirationDate < new Date(new Date().toUTCString())) {
        throw new BadRequestException('Voucher expired');
      }

      const discount = voucher.specialOffer.discountPercentage;

      voucher.redeemedAt = new Date();
      await queryRunner.manager.save(voucher);

      await queryRunner.commitTransaction();
      return discount;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
