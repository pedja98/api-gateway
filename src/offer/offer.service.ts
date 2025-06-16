import { HttpService } from '@nestjs/axios'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CreateOfferDto } from './dtos/create-offer.dto'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class OfferService {
  private readonly omApiUrl: string
  private readonly crmApiUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.omApiUrl = this.configService.get('endpoint.om')
    this.crmApiUrl = this.configService.get('endpoint.crm')
  }

  async createOffer(dto: CreateOfferDto, headers: Record<string, any>): Promise<any> {
    try {
      const omResponse = await firstValueFrom(
        this.httpService.post(`${this.omApiUrl}/offers`, { name: dto.name }, { headers }),
      )

      const omOfferId: string = omResponse.data.omOfferId

      const crmResponse = await firstValueFrom(
        this.httpService.post(
          `${this.crmApiUrl}/offers/`,
          {
            name: dto.name,
            omOfferId,
            companyId: dto.companyId,
            opportunityId: dto.opportunityId,
          },
          { headers },
        ),
      )

      return crmResponse.data
    } catch (error) {
      throw new InternalServerErrorException('Failed to create offer')
    }
  }
}
