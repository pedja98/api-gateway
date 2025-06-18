import { All, Controller, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { ProxyService } from './proxy.service'

@Controller({ path: 'proxy*' })
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('/*')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const { status, data } = await this.proxyService.forwardRequest(req)
      res.status(status).send(data)
    } catch (error) {
      res.status(error.getStatus?.() || 500).send(error.message || 'Internal server error')
    }
  }
}
