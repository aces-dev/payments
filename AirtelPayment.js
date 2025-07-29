const { randomUUID } = require('crypto');
const TokenManager = require('./TokenManager');
const CONFIG = require('./config');


class AirtelPayment {
  constructor() {
    this.tokenManager = new TokenManager();
  }

  async process({ phone, amount, user_uid }) {
    const token = await this.tokenManager.get();
    
    const payload = {
      reference: `Payment for ${user_uid}`,
      subscriber: {
        country: 'MW',
        currency: 'MWK',
        msisdn: phone.replace(/\D/g, '')
      },
      transaction: {
        amount: Number(amount),
        country: 'MW',
        currency: 'MWK',
        id: randomUUID()
      }
    };

    const res = await fetch(CONFIG.PAYMENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Country': 'MW',
        'X-Currency': 'MWK',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(`AirtelPayment Response:`, data);
    
    if (!res.ok) {
      // Return the error data instead of throwing, so we can save it to Firebase
      return {
        success: false,
        status: { success: false, code: res.status.toString() },
        data: data,
        error: data.message || `Payment failed: ${res.status}`
      };
    }
    
    return {
      success: true,
      ...data
    };
  }
}

module.exports = AirtelPayment;