import { Module } from '@nestjs/common'
import { OfferService } from './offer.service'
import { OfferController } from './offer.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
