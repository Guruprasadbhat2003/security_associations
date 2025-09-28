export interface SecurityAssociation {
  id?: string; // UUID from database
  destinationAddress: string;
  spi: number; // Security Parameter Index
  protocol: 'ESP' | 'AH'; // Encapsulating Security Payload or Authentication Header
  algorithm: string; // Encryption/Authentication algorithm
  key: string; // Security key (in practice would be encrypted)
  lifetime: number; // SA lifetime in seconds
  createdAt: Date;
  updatedAt?: Date;
  status: 'active' | 'expired' | 'pending';
  blockchainTxHash?: string; // Transaction hash for blockchain record
  blockchainVerified?: boolean; // Whether blockchain record is verified
}

export interface SALookupKey {
  destinationAddress: string;
  spi: number;
}

export interface BlockchainSARecord {
  destinationAddress: string;
  spi: number;
  protocol: string;
  algorithm: string;
  keyHash: string; // Hashed version of the key for privacy
  lifetime: number;
  status: string;
  timestamp: number;
  previousHash: string;
}

export interface DatabaseStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  blockchainVerified: number;
}