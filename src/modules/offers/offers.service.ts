import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { ProxyService } from '../proxy/proxy.service'
import { OfferDto } from './dtos/offer.dto'
import { OfferApprovalLevels } from './enums/offer-approval-level.enum'
import { OfferStatus } from './enums/offer-status.enum'
import { AvailableOfferStatuses } from './consts/offers'

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

  async calculateOffer(req: Request): Promise<any> {
    const approvalLevel = Math.random() < 0.5 ? OfferApprovalLevels.LEVEL_1 : OfferApprovalLevels.LEVEL_2
    const omOfferId = req.params.id as string

    const { status, data } = await this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers/${omOfferId}`, {
      approvalLevel,
    })

    if (status !== 200) {
      throw new HttpException('Error while updating OM offer', status)
    }

    return data
  }

  getAvailableStatuses(req: Request): OfferStatus[] {
    const status = req.params.status as OfferStatus
    return AvailableOfferStatuses[status] || []
  }

  async changeOfferStatus(req: Request): Promise<any> {
    const crmOfferId = req.params.id as string
    const omOfferId = req.body.omOfferId as string
    const oldStatus = req.body.oldStatus as OfferStatus
    const newStatus = req.body.newStatus as OfferStatus
    const approvalLevel = req.body.approvalLevel as OfferApprovalLevels

    const results = await Promise.all([
      await this.proxyService.forwardRequest(req, `${this.systemUrls.crm}/offers/${crmOfferId}`, undefined, 'GET'),
      await this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers/${omOfferId}`, undefined, 'GET'),
    ])

    const inValidOldStatus = results.some((result) => result.data.status !== oldStatus)

    const availableOfferStatus = AvailableOfferStatuses[oldStatus]

    if (
      inValidOldStatus ||
      !availableOfferStatus.includes(newStatus) ||
      (oldStatus === OfferStatus.DRAFT &&
        newStatus === OfferStatus.L1_PENDING &&
        approvalLevel === OfferApprovalLevels.LEVEL_2) ||
      (oldStatus === OfferStatus.DRAFT &&
        newStatus === OfferStatus.L2_PENDING &&
        approvalLevel === OfferApprovalLevels.LEVEL_1)
    ) {
      throw new HttpException('notAllowedToChangeToStatus', HttpStatus.METHOD_NOT_ALLOWED)
    }

    await Promise.all([
      await this.proxyService.forwardRequest(req, `${this.systemUrls.crm}/offers/${crmOfferId}`, {
        status: newStatus,
      }),
      await this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers/${omOfferId}`, {
        status: newStatus,
      }),
    ])

    return {
      message: 'statusChanged',
    }
  }
}
