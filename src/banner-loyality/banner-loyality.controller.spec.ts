import { Test, TestingModule } from '@nestjs/testing';
import { BannerLoyalityController } from './banner-loyality.controller';
import { BannerLoyalityService } from './banner-loyality.service';

describe('BannerLoyalityController', () => {
  let controller: BannerLoyalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerLoyalityController],
      providers: [BannerLoyalityService],
    }).compile();

    controller = module.get<BannerLoyalityController>(BannerLoyalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
