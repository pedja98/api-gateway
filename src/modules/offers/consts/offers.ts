import { OfferStatus } from '../enums/offer-status.enum'

export const AvailableOfferStatuses = {
  [OfferStatus.DRAFT]: [
    OfferStatus.L1_PENDING,
    OfferStatus.L2_PENDING,
    OfferStatus.OFFER_PENDING,
    OfferStatus.SALESMEN_CLOSED,
    OfferStatus.CLOSED_BY_SYSTEM,
  ],
  [OfferStatus.L1_PENDING]: [
    OfferStatus.L1_REJECTED,
    OfferStatus.OFFER_APPROVED,
    OfferStatus.SALESMEN_CLOSED,
    OfferStatus.CLOSED_BY_SYSTEM,
  ],
  [OfferStatus.OFFER_PENDING]: [
    OfferStatus.L1_REJECTED,
    OfferStatus.L2_REJECTED,
    OfferStatus.OFFER_APPROVED,
    OfferStatus.SALESMEN_CLOSED,
    OfferStatus.CLOSED_BY_SYSTEM,
  ],
  [OfferStatus.L2_PENDING]: [OfferStatus.L2_REJECTED, OfferStatus.OFFER_APPROVED, OfferStatus.SALESMEN_CLOSED],
  [OfferStatus.SALESMEN_CLOSED]: [],
  [OfferStatus.CLOSED_BY_SYSTEM]: [],
  [OfferStatus.L1_REJECTED]: [],
  [OfferStatus.L2_REJECTED]: [],
  [OfferStatus.OFFER_APPROVED]: [OfferStatus.CUSTOMER_ACCEPTED, OfferStatus.SALESMEN_CLOSED],
  [OfferStatus.CUSTOMER_ACCEPTED]: [OfferStatus.CLOSED_BY_SYSTEM, OfferStatus.CONCLUDED, OfferStatus.SALESMEN_CLOSED],
  [OfferStatus.CONCLUDED]: [],
}
