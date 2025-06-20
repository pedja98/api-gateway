import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { ProxyService } from '../proxy/proxy.service'
import { OfferDto } from './dtos/offer.dto'
import { OfferStatus } from './enums/offer-status.enum'
import { OfferApprovalLevels } from './enums/offer-approval-level.enum'
import { OfferApprovalStatus } from './enums/offer-approval-status.enum'

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

  async getOffer(req: Request): Promise<OfferDto> {
    const { status: crmStatus, data: crmOffer } = await this.proxyService.forwardRequest(
      req,
      `${this.systemUrls.crm}/offers/${req.params.id}`,
    )

    if (crmStatus !== 200) {
      throw new HttpException('Error while fetching CRM offer', crmStatus)
    }

    const { status: omStatus, data: omOffer } = await this.proxyService.forwardRequest(
      req,
      `${this.systemUrls.om}/offers/${crmOffer.omOfferId}`,
    )

    if (omStatus !== 200) {
      throw new HttpException('Error while fetching OM offer', omStatus)
    }

    return {
      crmOfferId: crmOffer.id,
      name: crmOffer.name,
      omOfferId: omOffer.id,
      companyId: crmOffer.companyId,
      companyName: crmOffer.companyName,
      opportunityId: crmOffer.opportunityId,
      opportunityName: crmOffer.opportunityName,
      contractId: crmOffer.contractId,
      contractName: crmOffer.contractName,
      status: crmOffer.status,
      createdByUsername: crmOffer.createdByUsername,
      modifiedByUsername: crmOffer.modifiedByUsername,
      dateCreated: crmOffer.dateCreated,
      dateModified: crmOffer.dateModified,
      mmc: omOffer.mmc,
      contractObligation: omOffer.contractObligation,
      approvalDescription: omOffer.approvalDescription,
      approvalLevel: omOffer.approvalLevel,
      approvalStatus: omOffer.approvalStatus,
    } as OfferDto
  }
}
