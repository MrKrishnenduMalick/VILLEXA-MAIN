/**
 * VILLEXA CUSTOMER ENQUIRY & QUOTATION TYPES
 */

export type EnquiryType = 'general' | 'product_quotation' | 'private_viewing' | 'bespoke_commission';

export interface CustomerEnquiry {
  id: string;
  type: EnquiryType;
  fullName: string;
  email: string;
  phone?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  productId?: string;
  productName?: string;
  message: string;
  requestedDate?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  createdAt: string;
}
