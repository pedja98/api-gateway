import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { ProxyService } from '../proxy/proxy.service'

@Injectable()
export class OffersService {
  private readonly systemUrls: Record<string, string>

  constructor(
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
  ) {
    this.systemUrls = {
      crm: this.configService.get<string>('endpoint.crm'),
      om: this.configService.get<string>('endpoint.om'),
    }
  }

  async createOffer(req: Request): Promise<any> {
    const { status, data } = await this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers`, {
      name: req.body.name,
    })
    if (status !== 200) {
      throw new HttpException('Error while creating offer', status)
    }
    const crmBody = {
      ...req.body,
      omOfferId: data['omOfferId'],
    }
    return this.proxyService.forwardRequest(req, `${this.systemUrls.crm}/offers`, crmBody)
  }
}
