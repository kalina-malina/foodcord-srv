import { Test, TestingModule } from '@nestjs/testing';
import { BannerLoyalityService } from './banner-loyality.service';

describe('BannerLoyalityService', () => {
  let service: BannerLoyalityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerLoyalityService],
    }).compile();

    service = module.get<BannerLoyalityService>(BannerLoyalityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
