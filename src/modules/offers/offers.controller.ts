import { Controller, Get, Param, Patch, Post, Req, Res } from '@nestjs/common'
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

  @Patch('calculate/:id')
  async calculateOffer(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.offersService.calculateOffer(req)
      res.status(200).json(data)
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }

  @Get('/statuses/:status')
  async getAvailableStatuses(@Req() req: Request, @Res() res: Response) {
    try {
      res.status(200).json(this.offersService.getAvailableStatuses(req))
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }

  @Patch('statuses/:id')
  async changeOfferStatus(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.offersService.changeOfferStatus(req)
      res.status(200).json(data)
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }
}
