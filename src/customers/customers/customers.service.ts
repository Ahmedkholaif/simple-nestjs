import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../../entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAll(): Promise<[Customer[], number]> {
    return this.customerRepository.findAndCount();
  }

  async create(body: Partial<Customer>): Promise<Customer> {
    const newCustomer = await this.customerRepository.save(body);
    return newCustomer;
  }
}
