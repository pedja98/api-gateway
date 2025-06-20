import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common'
import { OffersService } from './offers.service'
import { Request, Response } from 'express'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async createOffer(@Req() req: Request, @Res() res: Response) {
    try {
      const { data, status } = await this.offersService.createOffer(req)
      res.status(status).send(data)
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }

  @Get(':id')
  async getOffer(@Req() req: Request, @Res() res: Response) {
    try {
      const offer = await this.offersService.getOffer(req)
      res.status(200).json(offer)
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }
}
