import { Test, TestingModule } from '@nestjs/testing';
import { BannerMenuController } from './banner-menu.controller';
import { BannerMenuService } from './banner-menu.service';

describe('BannerMenuController', () => {
  let controller: BannerMenuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerMenuController],
      providers: [BannerMenuService],
    }).compile();

    controller = module.get<BannerMenuController>(BannerMenuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
