import { supabase } from '../lib/supabase';
import { blockchain } from '../lib/blockchain';
import { SecurityAssociation, SALookupKey, BlockchainSARecord, DatabaseStats } from '../types/SA';
import CryptoJS from 'crypto-js';

export class SADatabaseService {
  // Hash the security key for storage (never store plain text keys)
  private hashKey(key: string): string {
    return CryptoJS.SHA256(key).toString();
  }

  // Create blockchain record from SA
  private createBlockchainRecord(sa: SecurityAssociation): BlockchainSARecord {
    return {
      destinationAddress: sa.destinationAddress,
      spi: sa.spi,
      protocol: sa.protocol,
      algorithm: sa.algorithm,
      keyHash: this.hashKey(sa.key),
      lifetime: sa.lifetime,
      status: sa.status,
      timestamp: Date.now(),
      previousHash: blockchain.getLatestBlock().hash
    };
  }

  // Add SA to both database and blockchain
  async addSA(sa: Omit<SecurityAssociation, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string; sa?: SecurityAssociation }> {
    try {
      // Check if SA already exists
      const existing = await this.lookupSA({
        destinationAddress: sa.destinationAddress,
        spi: sa.spi
      });

      if (existing.success && existing.sa) {
        return { success: false, error: 'SA with this destination address and SPI already exists' };
      }

      // Insert into database
      const { data, error } = await supabase
        .from('security_associations')
        .insert({
          destination_address: sa.destinationAddress,
          spi: sa.spi,
          protocol: sa.protocol,
          algorithm: sa.algorithm,
          key_hash: this.hashKey(sa.key),
          lifetime: sa.lifetime,
          status: sa.status || 'active'
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Create blockchain record
      const blockchainRecord = this.createBlockchainRecord({
        ...sa,
        id: data.id,
        createdAt: new Date(data.created_at)
      });

      const block = blockchain.createSABlock(blockchainRecord);
      const txHash = blockchain.addBlock(block);

      // Update database with blockchain transaction hash
      await supabase
        .from('security_associations')
        .update({
          blockchain_tx_hash: txHash,
          blockchain_verified: true
        })
        .eq('id', data.id);

      // Log audit trail
      await supabase
        .from('sa_audit_log')
        .insert({
          sa_id: data.id,
          action: 'CREATE',
          new_values: data,
          blockchain_tx_hash: txHash
        });

      const newSA: SecurityAssociation = {
        id: data.id,
        destinationAddress: data.destination_address,
        spi: data.spi,
        protocol: data.protocol,
        algorithm: data.algorithm,
        key: sa.key, // Return original key (not stored in DB)
        lifetime: data.lifetime,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        blockchainTxHash: txHash,
        blockchainVerified: true
      };

      return { success: true, sa: newSA };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Delete SA from database and record in blockchain
  async deleteSA(lookupKey: SALookupKey): Promise<{ success: boolean; error?: string }> {
    try {
      // Get existing SA for audit log
      const existing = await this.lookupSA(lookupKey);
      if (!existing.success || !existing.sa) {
        return { success: false, error: 'SA not found' };
      }

      // Delete from database
      const { error } = await supabase
        .from('security_associations')
        .delete()
        .eq('destination_address', lookupKey.destinationAddress)
        .eq('spi', lookupKey.spi);

      if (error) {
        return { success: false, error: error.message };
      }

      // Record deletion in blockchain
      const blockchainRecord = this.createBlockchainRecord({
        ...existing.sa,
        status: 'deleted' as any
      });

      const block = blockchain.createSABlock(blockchainRecord);
      const txHash = blockchain.addBlock(block);

      // Log audit trail
      await supabase
        .from('sa_audit_log')
        .insert({
          sa_id: existing.sa.id!,
          action: 'DELETE',
          old_values: existing.sa,
          blockchain_tx_hash: txHash
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Lookup SA by destination address and SPI
  async lookupSA(lookupKey: SALookupKey): Promise<{ success: boolean; sa?: SecurityAssociation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('security_associations')
        .select('*')
        .eq('destination_address', lookupKey.destinationAddress)
        .eq('spi', lookupKey.spi)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, sa: undefined }; // Not found
        }
        return { success: false, error: error.message };
      }

      const sa: SecurityAssociation = {
        id: data.id,
        destinationAddress: data.destination_address,
        spi: data.spi,
        protocol: data.protocol,
        algorithm: data.algorithm,
        key: '***ENCRYPTED***', // Never return actual key
        lifetime: data.lifetime,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        blockchainTxHash: data.blockchain_tx_hash,
        blockchainVerified: data.blockchain_verified
      };

      return { success: true, sa };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get all SAs
  async getAllSAs(): Promise<{ success: boolean; sas?: SecurityAssociation[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('security_associations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const sas: SecurityAssociation[] = data.map(item => ({
        id: item.id,
        destinationAddress: item.destination_address,
        spi: item.spi,
        protocol: item.protocol,
        algorithm: item.algorithm,
        key: '***ENCRYPTED***',
        lifetime: item.lifetime,
        status: item.status,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        blockchainTxHash: item.blockchain_tx_hash,
        blockchainVerified: item.blockchain_verified
      }));

      return { success: true, sas };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Search SAs by destination address pattern
  async searchByDestination(pattern: string): Promise<{ success: boolean; sas?: SecurityAssociation[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('security_associations')
        .select('*')
        .ilike('destination_address', `%${pattern}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const sas: SecurityAssociation[] = data.map(item => ({
        id: item.id,
        destinationAddress: item.destination_address,
        spi: item.spi,
        protocol: item.protocol,
        algorithm: item.algorithm,
        key: '***ENCRYPTED***',
        lifetime: item.lifetime,
        status: item.status,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        blockchainTxHash: item.blockchain_tx_hash,
        blockchainVerified: item.blockchain_verified
      }));

      return { success: true, sas };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Update SA status
  async updateSAStatus(lookupKey: SALookupKey, status: SecurityAssociation['status']): Promise<{ success: boolean; error?: string }> {
    try {
      // Get existing SA for audit log
      const existing = await this.lookupSA(lookupKey);
      if (!existing.success || !existing.sa) {
        return { success: false, error: 'SA not found' };
      }

      // Update in database
      const { data, error } = await supabase
        .from('security_associations')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('destination_address', lookupKey.destinationAddress)
        .eq('spi', lookupKey.spi)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Record update in blockchain
      const blockchainRecord = this.createBlockchainRecord({
        ...existing.sa,
        status
      });

      const block = blockchain.createSABlock(blockchainRecord);
      const txHash = blockchain.addBlock(block);

      // Update blockchain transaction hash
      await supabase
        .from('security_associations')
        .update({ blockchain_tx_hash: txHash })
        .eq('id', data.id);

      // Log audit trail
      await supabase
        .from('sa_audit_log')
        .insert({
          sa_id: existing.sa.id!,
          action: 'UPDATE',
          old_values: existing.sa,
          new_values: { ...existing.sa, status },
          blockchain_tx_hash: txHash
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get database statistics
  async getStats(): Promise<{ success: boolean; stats?: DatabaseStats; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('security_associations')
        .select('status, blockchain_verified');

      if (error) {
        return { success: false, error: error.message };
      }

      const stats: DatabaseStats = {
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        expired: data.filter(item => item.status === 'expired').length,
        pending: data.filter(item => item.status === 'pending').length,
        blockchainVerified: data.filter(item => item.blockchain_verified).length
      };

      return { success: true, stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Verify blockchain integrity
  verifyBlockchainIntegrity(): boolean {
    return blockchain.isChainValid();
  }

  // Get blockchain block by transaction hash
  getBlockchainBlock(txHash: string) {
    return blockchain.getBlockByHash(txHash);
  }
}