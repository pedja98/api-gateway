import { OfferStatus } from '../enums/offer-status.enum'
import { OfferApprovalLevels } from '../enums/offer-approval-level.enum'
import { OfferApprovalStatus } from '../enums/offer-approval-status.enum'

export class OfferDto {
  crmOfferId: number
  name: string
  omOfferId: string
  companyId: number
  companyName: string
  opportunityId: number
  opportunityName: string
  contractId: number
  contractName: string
  status: OfferStatus
  createdByUsername: string
  modifiedByUsername: string
  dateCreated: string
  dateModified: string
  mmc: number
  contractObligation: number
  approvalDescription: string
  approvalLevel: OfferApprovalLevels
  approvalStatus: OfferApprovalStatus
}
