import { supabase, isSupabaseConfigured } from './supabaseClient';
import { EnquiryType } from '../types/enquiry';

export const enquiryService = {
  async submitEnquiry(payload: {
    type: EnquiryType;
    fullName: string;
    email: string;
    phone?: string;
    preferredContact: 'email' | 'phone' | 'whatsapp';
    productId?: string;
    productName?: string;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      // In offline / unconfigured mode, simulate successful dispatch
      return { success: true };
    }

    try {
      const { error } = await supabase.from('enquiries').insert([
        {
          type: payload.type,
          full_name: payload.fullName.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() || null,
          preferred_contact: payload.preferredContact,
          product_id: payload.productId || null,
          product_name: payload.productName || null,
          message: payload.message.trim(),
          status: 'new'
        }
      ]);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit enquiry';
      return { success: false, error: msg };
    }
  }
};
