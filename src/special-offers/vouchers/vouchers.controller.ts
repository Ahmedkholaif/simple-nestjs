import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { VouchersService } from '../vouchers/vouchers.service';
import { CustomersService } from '../../customers/customers/customers.service';
import { SpecialOffersService } from '../special-offers/special-offers.service';
import { DataSource } from 'typeorm';
import { FilterQueryDto, PaginationQueryDto } from '../../dto/query.dto';
import {
  CreateVoucherDto,
  FilterByEmailBodyDto,
  ValidateVoucherDto,
} from '../../dto/voucher.dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller('vouchers')
export class VouchersController {
  constructor(
    private readonly vouchersService: VouchersService,
    private readonly customersService: CustomersService,
    private readonly specialOffersService: SpecialOffersService,
    private dataSource: DataSource,
  ) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 600,
    },
  })
  @Get()
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by customer email',
  })
  @ApiQuery({
    name: 'offerId',
    required: false,
    type: String,
    description: 'Filter by special offer id',
  })
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
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() filter: FilterQueryDto,
  ) {
    let { limit = 10, page = 1 } = paginationQuery;

    limit = Math.min(100, limit);
    page = Math.max(1, page);
    const queryFilter: {
      [key: string]: any;
    } = {};
    if (filter.email) {
      queryFilter.customer = { email: filter.email };
    }
    if (filter.offerId) {
      queryFilter.specialOffer = { id: filter.offerId };
    }
    return this.vouchersService.findWithFilterPaginated(
      queryFilter,
      limit,
      page,
    );
  }

  @Post('/get-by-email')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'email@example.com' },
      },
    },
  })
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
  findByEmail(
    @Body() body: FilterByEmailBodyDto,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    let { limit = 10, page = 1 } = paginationQuery;

    limit = Math.min(100, limit);
    page = Math.max(1, page);
    const { email } = body;
    return this.vouchersService.findByEmailPaginated(email, limit, page);
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        offerId: { type: 'string', example: '1' },
        expirationDate: { type: 'string', example: '2025-03-01' },
      },
    },
  })
  create(@Body() body: CreateVoucherDto) {
    return this.vouchersService.generateVoucher(
      body.offerId,
      body.expirationDate,
    );
  }

  @Post('redeem')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'code1234' },
        email: { type: 'string', example: 'email@example.co' },
      },
    },
  })
  async redeemVoucher(@Body() body: ValidateVoucherDto) {
    const { code, email } = body;
    const discount = await this.vouchersService.redeemVoucher(code, email);
    if (!discount) throw new NotFoundException('Voucher not found');
    return { discount };
  }
}
