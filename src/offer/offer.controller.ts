import { Body, Controller, Post, Req } from '@nestjs/common'
import { OfferService } from './offer.service'
import { CreateOfferDto } from './dtos/create-offer.dto'
import { Request } from 'express'

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  async createOffer(@Body() dto: CreateOfferDto, @Req() req: Request) {
    return this.offerService.createOffer(dto, req.headers)
  }
}
