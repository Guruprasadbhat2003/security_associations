# Security Association Database - Setup Guide

This application implements a comprehensive Security Association (SA) Database with both traditional database storage and blockchain integration for enterprise-grade security.

## 🏗️ Architecture Overview

### 1. Database Layer (Supabase PostgreSQL)
- **Primary Storage**: All SA records stored in PostgreSQL with Row Level Security (RLS)
- **Audit Trail**: Complete audit log of all operations (CREATE, UPDATE, DELETE)
- **Security**: Keys are hashed with SHA-256, never stored in plain text
- **Performance**: Optimized indexes for fast lookups by destination address and SPI

### 2. Blockchain Layer (Immutable Audit Trail)
- **Simple Blockchain**: Custom implementation with SHA-256 hashing and proof-of-work
- **Immutable Records**: Every SA operation recorded on blockchain for tamper-proof audit
- **Integrity Verification**: Real-time blockchain integrity checking
- **Transaction Hashes**: Each operation gets a unique blockchain transaction hash

### 3. Frontend (React + TypeScript)
- **Modern UI**: Clean, professional interface designed for security administrators
- **Real-time Updates**: Live status monitoring and blockchain verification
- **Form Validation**: Comprehensive validation for all security parameters
- **Search & Filter**: Advanced filtering by status, destination address, etc.

## 🚀 Step-by-Step Setup Guide

### Step 1: Supabase Database Setup

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**
   - In your Supabase dashboard, go to Settings → API
   - Copy your `Project URL` and `anon public` key
   - Click the "Supabase" button in the Bolt interface (settings icon above preview)
   - Enter your credentials

3. **Database Schema**
   - The migration file will automatically create the required tables:
     - `security_associations`: Main SA storage
     - `sa_audit_log`: Audit trail for all operations
   - Includes proper indexes, constraints, and RLS policies

### Step 2: Environment Configuration

The application will automatically use your Supabase credentials once configured through the Bolt interface.

### Step 3: Understanding the Data Flow

#### Adding a Security Association:
1. **Frontend Validation**: Form validates IP address, SPI range, algorithm, etc.
2. **Database Insert**: SA stored in PostgreSQL with hashed key
3. **Blockchain Record**: Immutable record created on blockchain
4. **Audit Log**: Operation logged with blockchain transaction hash
5. **UI Update**: Real-time update with blockchain verification status

#### Lookup Operations:
1. **Database Query**: Fast lookup using destination address + SPI index
2. **Blockchain Verification**: Optional verification against blockchain record
3. **Security**: Keys never returned in plain text (shown as ***ENCRYPTED***)

#### Status Updates:
1. **Database Update**: Status changed in PostgreSQL
2. **Blockchain Record**: New blockchain entry for the update
3. **Audit Trail**: Complete before/after values logged
4. **Integrity Check**: Blockchain integrity verified

### Step 4: Security Features

#### Key Security Measures:
- **No Plain Text Keys**: All keys hashed with SHA-256 before storage
- **Row Level Security**: Supabase RLS policies protect data access
- **Blockchain Integrity**: Tamper-proof audit trail with hash verification
- **Input Validation**: Comprehensive validation on all security parameters
- **Audit Logging**: Complete audit trail of all operations

#### Blockchain Security:
- **SHA-256 Hashing**: All blocks secured with cryptographic hashing
- **Proof of Work**: Mining difficulty ensures computational cost for tampering
- **Chain Validation**: Real-time integrity checking of entire blockchain
- **Immutable Records**: Once recorded, blockchain entries cannot be modified

### Step 5: Using the Application

#### Adding Security Associations:
1. Fill out the SA form with required parameters:
   - **Destination Address**: Target IP address (validated format)
   - **SPI**: Security Parameter Index (256-4294967295)
   - **Protocol**: ESP (Encapsulating Security Payload) or AH (Authentication Header)
   - **Algorithm**: Encryption/authentication algorithm (e.g., AES-256-GCM)
   - **Security Key**: Minimum 8 characters (hashed before storage)
   - **Lifetime**: SA lifetime in seconds

2. Click "Add Security Association"
3. Watch real-time blockchain verification

#### Managing Existing SAs:
- **Search**: Filter by destination address
- **Status Filter**: View by status (active, expired, pending)
- **Status Updates**: Change SA status with dropdown
- **Delete**: Remove SAs with confirmation dialog
- **Blockchain Verification**: See blockchain status for each SA

#### Monitoring System Health:
- **Blockchain Status**: Real-time integrity verification
- **Database Statistics**: Live counts of SAs by status
- **Audit Trail**: Complete history of all operations

## 🔧 Technical Implementation Details

### Database Schema:
```sql
-- Main SA table with unique constraint on destination_address + spi
security_associations (
  id uuid PRIMARY KEY,
  destination_address text NOT NULL,
  spi integer NOT NULL,
  protocol text CHECK (protocol IN ('ESP', 'AH')),
  algorithm text NOT NULL,
  key_hash text NOT NULL, -- SHA-256 hash of actual key
  lifetime integer CHECK (lifetime > 0),
  status text CHECK (status IN ('active', 'expired', 'pending')),
  blockchain_tx_hash text,
  blockchain_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(destination_address, spi)
);

-- Audit log for complete operation history
sa_audit_log (
  id uuid PRIMARY KEY,
  sa_id uuid NOT NULL,
  action text CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  blockchain_tx_hash text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);
```

### Blockchain Implementation:
```typescript
// Simple blockchain with proof-of-work consensus
class SimpleBlockchain {
  private chain: Block[] = [];
  private difficulty = 2; // Mining difficulty
  
  // Each block contains SA operation data
  // SHA-256 hashing ensures integrity
  // Proof-of-work prevents tampering
}
```

### API Layer:
```typescript
// Service layer handles all database and blockchain operations
class SADatabaseService {
  async addSA(sa) {
    // 1. Validate and insert into database
    // 2. Create blockchain record
    // 3. Update with blockchain transaction hash
    // 4. Log audit trail
  }
}
```

## 🛡️ Security Considerations

### Production Deployment:
1. **Environment Variables**: Use proper environment variable management
2. **Database Security**: Enable additional Supabase security features
3. **Key Management**: Implement proper key rotation and management
4. **Access Control**: Add user authentication and role-based access
5. **Network Security**: Use HTTPS and proper network security measures

### Blockchain Considerations:
1. **Real Blockchain**: Consider using Ethereum or other established blockchain for production
2. **Gas Costs**: Factor in transaction costs for blockchain operations
3. **Scalability**: Implement off-chain storage with on-chain hashes for large deployments
4. **Consensus**: Use established consensus mechanisms for production systems

## 📊 Monitoring and Maintenance

### Health Checks:
- **Database Connectivity**: Monitor Supabase connection status
- **Blockchain Integrity**: Automated integrity verification every 30 seconds
- **Performance Metrics**: Track query performance and response times
- **Audit Compliance**: Regular audit log reviews

### Backup and Recovery:
- **Database Backups**: Supabase provides automated backups
- **Blockchain Export**: Export blockchain data for disaster recovery
- **Key Recovery**: Implement secure key backup procedures
- **Audit Trail Preservation**: Ensure audit logs are preserved

This implementation provides enterprise-grade security for IPSec Security Association management with both traditional database reliability and blockchain immutability.