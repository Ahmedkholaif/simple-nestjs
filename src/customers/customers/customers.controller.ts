import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateCustomerDto } from '../../dto/customer.dto';
import { CustomersService } from '../customers/customers.service';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' }, name: { type: 'string' } },
    },
  })
  create(@Body() body: CreateCustomerDto) {
    return this.customerService.create(body);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of vouchers per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  findAll() {
    return this.customerService.findAll();
  }
}
