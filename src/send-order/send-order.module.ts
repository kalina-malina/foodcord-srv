import { Module } from '@nestjs/common';
import { SendOrderService } from './send-order.service';

@Module({
  providers: [SendOrderService],
  exports: [SendOrderService],
})
export class SendOrderModule {}
