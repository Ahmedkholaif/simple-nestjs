import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SpecialOffersService } from './special-offers.service';
import { CreateSpecialOfferDto } from '../../dto/special-offer.dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('special-offers')
export class SpecialOffersController {
  constructor(private readonly specialOffersService: SpecialOffersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        discountPercentage: { type: 'number' },
        name: { type: 'string' },
      },
    },
  })
  create(@Body() body: CreateSpecialOfferDto) {
    return this.specialOffersService.create(body);
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
    return this.specialOffersService.findAll();
  }
}
