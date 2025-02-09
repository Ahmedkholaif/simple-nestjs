import { Module } from '@nestjs/common';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]), // forFeature() method to define which repositories are registered in the current scope
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
