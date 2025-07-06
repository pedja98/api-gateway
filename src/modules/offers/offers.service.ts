import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { ProxyService } from '../proxy/proxy.service'
import { OfferApprovalLevels } from './enums/offer-approval-level.enum'
import { OfferStatus } from './enums/offer-status.enum'
import { AvailableOfferStatuses } from './consts/offers'
import { OpportunityType } from './enums/opportunity-type.enum'

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
    if (['CLOSE_LOST', 'CLOSE_WON'].includes(req.body.status)) {
      throw new HttpException('Not allowed to create offer in that status', HttpStatus.FORBIDDEN)
    }

    const { status, data } = await this.proxyService.forwardRequest(req, `${this.systemUrls.crm}/offers`, {
      ...req.body,
    })
    if (status !== 200) {
      throw new HttpException('Error while creating offer', status)
    }
    let contractObligation = 0

    if (req.body.opportunityType === OpportunityType.CHANGE) {
      const { status, data } = await this.proxyService.forwardRequest(
        req,
        `${this.systemUrls.crm}/contracts/remaining-months/${req.body.companyId}`,
        undefined,
        'GET',
      )
      if (status !== 200) {
        throw new HttpException('Error while creating offer', status)
      }
      contractObligation = data
    }

    const omBody = {
      ...req.body,
      crmOfferId: data['crmOfferId'],
      contractObligation,
    }

    return this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers`, omBody)
  }

  async calculateOffer(req: Request): Promise<any> {
    const approvalLevel = Math.random() < 0.5 ? OfferApprovalLevels.LEVEL_1 : OfferApprovalLevels.LEVEL_2
    const omOfferId = req.params.id as string

    const { status } = await this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers/${omOfferId}`, {
      approvalLevel,
    })

    if (status !== 200) {
      throw new HttpException('Error while updating OM offer', status)
    }

    return { message: 'calculateSuccessful', approvalLevel }
  }

  async changeOfferStatus(req: Request): Promise<{
    message: string
  }> {
    const crmOfferId = req.body.crmOfferId as string
    const omOfferId = req.params.id as string
    const oldStatus = req.body.oldStatus as OfferStatus
    const newStatus = req.body.newStatus as OfferStatus

    const { approvalLevel: calculatedApprovalLevel } = await this.calculateOffer(req)
    const newCrmStatus =
      newStatus === OfferStatus.OFFER_PENDING
        ? calculatedApprovalLevel === OfferApprovalLevels.LEVEL_1
          ? OfferStatus.L1_PENDING
          : OfferStatus.L2_PENDING
        : newStatus

    const availableOfferStatus = AvailableOfferStatuses[oldStatus]

    if (!availableOfferStatus.includes(newStatus)) {
      throw new HttpException('notAllowedToChangeToStatus', HttpStatus.METHOD_NOT_ALLOWED)
    }

    const result = await Promise.all([
      await this.proxyService.forwardRequest(req, `${this.systemUrls.crm}/offers/${crmOfferId}`, {
        status: newCrmStatus,
      }),
      await this.proxyService.forwardRequest(req, `${this.systemUrls.om}/offers/${omOfferId}`, {
        status: newStatus,
      }),
    ])

    result.forEach((elem) => {
      if (elem.status !== HttpStatus.OK) {
        throw new HttpException('notAllowedToChangeToStatus', elem.status)
      }
    })

    if (newStatus === OfferStatus.OFFER_APPROVED) {
      const { data } = await this.proxyService.forwardRequest(
        req,
        `${this.systemUrls.om}/offers/${omOfferId}`,
        undefined,
        'GET',
      )

      await this.proxyService.forwardRequest(
        req,
        `${this.systemUrls.crm}/contracts`,
        {
          contractObligation: data.contractObligation,
          offerId: crmOfferId,
        },
        'POST',
      )
    }
    return {
      message: 'statusChanged',
    }
  }
}
