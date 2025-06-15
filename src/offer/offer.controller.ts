import { Body, Controller, Post } from '@nestjs/common'
import { OfferService } from './offer.service'
import { CreateOfferDto } from './dtos/create-offer.dto'

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  async createOffer(@Body() dto: CreateOfferDto) {
    return this.offerService.createOffer(dto)
  }
}
