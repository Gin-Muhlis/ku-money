import Xendit from 'xendit-node';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Xendit Client
const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_KEY,
});

const { Invoice } = xenditClient;

/**
 * Create Xendit Invoice untuk payment
 * @param {Object} data - Data untuk create invoice
 * @param {string} data.transactionId - Unique transaction ID (external_id)
 * @param {number} data.amount - Amount to be paid
 * @param {string} data.email - Payer email
 * @param {string} data.description - Invoice description
 * @param {string} data.successRedirectUrl - URL untuk redirect saat payment success
 * @param {string} data.failureRedirectUrl - URL untuk redirect saat payment failed
 * @returns {Promise<Object>} Invoice object dari Xendit
 */
export const createInvoice = async (data) => {
  try {
    const {
      transactionId,
      amount,
      email,
      description,
      successRedirectUrl,
      failureRedirectUrl,
    } = data;

    const invoiceData = {
      externalId: transactionId,
      amount: amount,
      payerEmail: email,
      description: description,
      invoiceDuration: 86400, // 24 jam dalam detik
      currency: 'IDR',
      reminderTime: 1, // Reminder 1 hari sebelum expired
      successRedirectUrl: successRedirectUrl,
      failureRedirectUrl: failureRedirectUrl,
    };

    const invoice = await Invoice.createInvoice(invoiceData);

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        externalId: invoice.external_id,
        amount: invoice.amount,
        status: invoice.status,
        expiryDate: invoice.expiry_date,
      },
    };
  } catch (error) {
    console.error('Xendit Create Invoice Error:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to create invoice',
        code: error.error_code || 'XENDIT_ERROR',
      },
    };
  }
};

/**
 * Get Invoice detail dari Xendit
 * @param {string} invoiceId - Invoice ID dari Xendit
 * @returns {Promise<Object>} Invoice detail
 */
export const getInvoice = async (invoiceId) => {
  try {
    const invoice = await Invoice.getInvoice({ invoiceId });

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        externalId: invoice.external_id,
        amount: invoice.amount,
        status: invoice.status,
        paymentMethod: invoice.payment_method,
        paidAt: invoice.paid_at,
        expiryDate: invoice.expiry_date,
      },
    };
  } catch (error) {
    console.error('Xendit Get Invoice Error:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to get invoice',
        code: error.error_code || 'XENDIT_ERROR',
      },
    };
  }
};

/**
 * Expire Invoice (untuk cancel order)
 * @param {string} invoiceId - Invoice ID dari Xendit
 * @returns {Promise<Object>} Result
 */
export const expireInvoice = async (invoiceId) => {
  try {
    const invoice = await Invoice.expireInvoice({ invoiceId });

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        status: invoice.status,
      },
    };
  } catch (error) {
    console.error('Xendit Expire Invoice Error:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to expire invoice',
        code: error.error_code || 'XENDIT_ERROR',
      },
    };
  }
};

/**
 * Verify callback token dari Xendit webhook
 * @param {string} callbackToken - Token dari header x-callback-token
 * @returns {boolean} True jika valid
 */
export const verifyCallbackToken = (callbackToken) => {
  const xenditCallbackToken = process.env.XENDIT_CALLBACK_TOKEN;
  
  if (!xenditCallbackToken) {
    console.warn('XENDIT_CALLBACK_TOKEN not set in environment variables');
    return false;
  }

  return callbackToken === xenditCallbackToken;
};

