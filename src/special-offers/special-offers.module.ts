import { CustomersService } from '../customers/customers/customers.service';
import { Module } from '@nestjs/common';
import { SpecialOffersService } from './special-offers/special-offers.service';
import { SpecialOffersController } from './special-offers/special-offers.controller';
import { VouchersService } from './vouchers/vouchers.service';
import { VouchersController } from './vouchers/vouchers.controller';
import { CustomersModule } from '../customers/customers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Voucher } from '../entities/voucher.entity';
import { SpecialOffer } from '../entities/special-offer.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
@Module({
  imports: [
    CustomersModule,
    TypeOrmModule.forFeature([Customer, SpecialOffer, Voucher]), // forFeature() method to define which repositories are registered in the current scope
  ],
  controllers: [VouchersController, SpecialOffersController],
  providers: [
    SpecialOffersService,
    VouchersService,
    CustomersService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class SpecialOffersModule {}
