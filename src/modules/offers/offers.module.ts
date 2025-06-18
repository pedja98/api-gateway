import { Module } from '@nestjs/common'
import { OffersService } from './offers.service'
import { OffersController } from './offers.controller'
import { ProxyModule } from '../proxy/proxy.module'

@Module({
  imports: [ProxyModule],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
