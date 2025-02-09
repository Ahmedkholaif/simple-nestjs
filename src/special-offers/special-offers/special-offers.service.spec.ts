import { Test, TestingModule } from '@nestjs/testing';
import { SpecialOffersService } from './special-offers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpecialOffer } from '../../entities/special-offer.entity';

describe('SpecialOffersService', () => {
  let service: SpecialOffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialOffersService,
        { provide: getRepositoryToken(SpecialOffer), useValue: {} },
      ],
    }).compile();

    service = module.get<SpecialOffersService>(SpecialOffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
