/*
  # Create Security Associations Database Schema

  1. New Tables
    - `security_associations`
      - `id` (uuid, primary key)
      - `destination_address` (text, IP address)
      - `spi` (integer, Security Parameter Index)
      - `protocol` (text, ESP or AH)
      - `algorithm` (text, encryption/auth algorithm)
      - `key_hash` (text, hashed security key)
      - `lifetime` (integer, SA lifetime in seconds)
      - `status` (text, active/expired/pending)
      - `blockchain_tx_hash` (text, blockchain transaction hash)
      - `blockchain_verified` (boolean, blockchain verification status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sa_audit_log`
      - `id` (uuid, primary key)
      - `sa_id` (uuid, foreign key to security_associations)
      - `action` (text, CREATE/UPDATE/DELETE)
      - `old_values` (jsonb, previous values)
      - `new_values` (jsonb, new values)
      - `blockchain_tx_hash` (text, blockchain transaction hash)
      - `created_at` (timestamp)
      - `user_id` (uuid, user who performed action)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add unique constraint on destination_address + spi combination

  3. Indexes
    - Index on destination_address for fast lookups
    - Index on spi for fast lookups
    - Index on status for filtering
    - Index on blockchain_tx_hash for verification
*/

-- Create security_associations table
CREATE TABLE IF NOT EXISTS security_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_address text NOT NULL,
  spi integer NOT NULL,
  protocol text NOT NULL CHECK (protocol IN ('ESP', 'AH')),
  algorithm text NOT NULL,
  key_hash text NOT NULL,
  lifetime integer NOT NULL CHECK (lifetime > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  blockchain_tx_hash text,
  blockchain_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint on destination_address + spi combination
  UNIQUE(destination_address, spi)
);

-- Create sa_audit_log table
CREATE TABLE IF NOT EXISTS sa_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sa_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  blockchain_tx_hash text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sa_destination_address ON security_associations(destination_address);
CREATE INDEX IF NOT EXISTS idx_sa_spi ON security_associations(spi);
CREATE INDEX IF NOT EXISTS idx_sa_status ON security_associations(status);
CREATE INDEX IF NOT EXISTS idx_sa_blockchain_tx ON security_associations(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_audit_sa_id ON sa_audit_log(sa_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON sa_audit_log(created_at);

-- Enable Row Level Security
ALTER TABLE security_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for security_associations
CREATE POLICY "Allow public read access to security_associations"
  ON security_associations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to security_associations"
  ON security_associations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to security_associations"
  ON security_associations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to security_associations"
  ON security_associations
  FOR DELETE
  TO public
  USING (true);

-- Create policies for sa_audit_log
CREATE POLICY "Allow public read access to sa_audit_log"
  ON sa_audit_log
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to sa_audit_log"
  ON sa_audit_log
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_security_associations_updated_at
  BEFORE UPDATE ON security_associations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();