const { CONFIG } = require('./config');

class TokenManager {
  constructor() {
    this.token = null;
  }

  async get() {
    console.log(`Config ${CONFIG}`);
    const res = await fetch(CONFIG.AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
    
    console.log(`TokenManager Response: ${res.status}`);
    const { access_token } = await res.json();
    this.token = access_token;
    
    return this.token;
  }
}

module.exports = TokenManager;
