import { Test, TestingModule } from '@nestjs/testing';
import { BannerMenuService } from './banner-menu.service';

describe('BannerMenuService', () => {
  let service: BannerMenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerMenuService],
    }).compile();

    service = module.get<BannerMenuService>(BannerMenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
