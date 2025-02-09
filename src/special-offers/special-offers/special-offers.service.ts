import { Injectable } from '@nestjs/common';
import { SpecialOffer } from '../../entities/special-offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialOffersService {
  constructor(
    @InjectRepository(SpecialOffer)
    private specialOfferRepo: Repository<SpecialOffer>,
  ) {}

  findAll(): Promise<[SpecialOffer[], number]> {
    return this.specialOfferRepo.findAndCount();
  }

  create(body: any): Promise<SpecialOffer> {
    return this.specialOfferRepo.save(body);
  }
}
