import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { Voucher } from './entities/voucher.entity';
import { SpecialOffer } from './entities/special-offer.entity';
import { Customer } from './entities/customer.entity';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CustomersModule } from './customers/customers.module';
import { SpecialOffersModule } from './special-offers/special-offers.module';
import Redis from 'ioredis';
import { APP_GUARD } from '@nestjs/core';

const syncDB = process.env.SYNC_DB === 'true' ? true : false;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.development.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true, // automatically load entities from the entities folder
      entities: [Voucher, SpecialOffer, Customer],
      synchronize: syncDB, // DO NOT USE IN PRODUCTION
    }),
    TypeOrmModule.forFeature([Customer, SpecialOffer, Voucher]), // forFeature() method to define which repositories are registered in the current scope
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000, // time in milliseconds
          limit: 5, //The maximum number of requests a client can make within the ttl window (e.g., 10 requests)
        },
      ],
      errorMessage: 'You have reached the limit of requests',
      storage: process.env.REDIS_HOST
        ? new ThrottlerStorageRedisService(
            new Redis({
              host: process.env.REDIS_HOST,
              port: +(process.env.REDIS_PORT || 6379),
            }),
          )
        : undefined,
    }),
    CustomersModule,
    SpecialOffersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
