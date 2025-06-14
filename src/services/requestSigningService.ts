
interface SignedRequest {
  method: string;
  url: string;
  body?: any;
  timestamp: number;
  nonce: string;
  signature: string;
}

interface SigningConfig {
  secretKey: string;
  algorithm: string;
  expirationMinutes: number;
}

class RequestSigningService {
  private config: SigningConfig = {
    secretKey: 'lovable-platform-secret-key', // In production, use environment variable
    algorithm: 'SHA-256',
    expirationMinutes: 5
  };

  // Generate a cryptographic nonce
  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create HMAC-like signature using Web Crypto API
  private async createSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.config.secretKey);
    const messageData = encoder.encode(data);
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Sign the data
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    
    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  // Sign a request for critical operations
  async signRequest(method: string, url: string, body?: any): Promise<SignedRequest> {
    const timestamp = Date.now();
    const nonce = this.generateNonce();
    
    // Create canonical string for signing
    const canonicalString = [
      method.toUpperCase(),
      url,
      JSON.stringify(body || {}),
      timestamp.toString(),
      nonce
    ].join('\n');
    
    const signature = await this.createSignature(canonicalString);
    
    return {
      method,
      url,
      body,
      timestamp,
      nonce,
      signature
    };
  }

  // Verify a signed request
  async verifySignature(signedRequest: SignedRequest): Promise<{ valid: boolean; error?: string }> {
    const now = Date.now();
    const maxAge = this.config.expirationMinutes * 60 * 1000;
    
    // Check timestamp
    if (now - signedRequest.timestamp > maxAge) {
      return { valid: false, error: 'Request expired' };
    }
    
    // Recreate canonical string
    const canonicalString = [
      signedRequest.method.toUpperCase(),
      signedRequest.url,
      JSON.stringify(signedRequest.body || {}),
      signedRequest.timestamp.toString(),
      signedRequest.nonce
    ].join('\n');
    
    // Verify signature
    const expectedSignature = await this.createSignature(canonicalString);
    
    if (expectedSignature !== signedRequest.signature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true };
  }

  // Create signed headers for fetch requests
  createSignedHeaders(signedRequest: SignedRequest): Record<string, string> {
    return {
      'X-Signature': signedRequest.signature,
      'X-Timestamp': signedRequest.timestamp.toString(),
      'X-Nonce': signedRequest.nonce,
      'X-Algorithm': this.config.algorithm
    };
  }

  // Middleware for validating signed requests
  validateRequestSignature = async (headers: Record<string, string>, method: string, url: string, body?: any): Promise<boolean> => {
    const signature = headers['X-Signature'];
    const timestamp = headers['X-Timestamp'];
    const nonce = headers['X-Nonce'];
    
    if (!signature || !timestamp || !nonce) {
      return false;
    }
    
    const signedRequest: SignedRequest = {
      method,
      url,
      body,
      timestamp: parseInt(timestamp),
      nonce,
      signature
    };
    
    const verification = await this.verifySignature(signedRequest);
    return verification.valid;
  };
}

export const requestSigningService = new RequestSigningService();
