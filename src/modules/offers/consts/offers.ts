import { OfferStatus } from '../enums/offer-status.enum'

export const AvailableOfferStatuses = {
  [OfferStatus.DRAFT]: [OfferStatus.L1_PENDING, OfferStatus.L2_PENDING, OfferStatus.SALESMEN_CLOSED],
  [OfferStatus.L1_PENDING]: [OfferStatus.L1_REJECTED, OfferStatus.CUSTOMER_ACCEPTED],
  [OfferStatus.L2_PENDING]: [OfferStatus.L2_REJECTED, OfferStatus.CUSTOMER_ACCEPTED],
  [OfferStatus.SALESMEN_CLOSED]: [],
  [OfferStatus.CLOSED_BY_SYSTEM]: [],
  [OfferStatus.L1_REJECTED]: [],
  [OfferStatus.L2_REJECTED]: [],
  [OfferStatus.CUSTOMER_ACCEPTED]: [OfferStatus.CLOSED_BY_SYSTEM, OfferStatus.CONCLUDED],
  [OfferStatus.CONCLUDED]: [],
}
