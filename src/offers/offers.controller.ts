import { Controller, Post, Req, Res } from '@nestjs/common'
import { OffersService } from './offers.service'
import { Request, Response } from 'express'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.offersService.createOffer(req)
      res.status(200).send(data)
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }
}
