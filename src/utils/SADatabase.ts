import { SecurityAssociation, SALookupKey } from '../types/SA';

export class SADatabase {
  private sas: Map<string, SecurityAssociation> = new Map();

  // Generate unique key from destination address and SPI
  private generateKey(destinationAddress: string, spi: number): string {
    return `${destinationAddress}:${spi}`;
  }

  // Add a new Security Association
  addSA(sa: SecurityAssociation): boolean {
    const key = this.generateKey(sa.destinationAddress, sa.spi);
    
    // Check if SA already exists
    if (this.sas.has(key)) {
      return false; // SA already exists
    }
    
    this.sas.set(key, { ...sa, createdAt: new Date() });
    return true;
  }

  // Delete SA by destination address and SPI
  deleteSA(lookupKey: SALookupKey): boolean {
    const key = this.generateKey(lookupKey.destinationAddress, lookupKey.spi);
    return this.sas.delete(key);
  }

  // Lookup SA by destination address and SPI
  lookupSA(lookupKey: SALookupKey): SecurityAssociation | null {
    const key = this.generateKey(lookupKey.destinationAddress, lookupKey.spi);
    return this.sas.get(key) || null;
  }

  // Get all SAs
  getAllSAs(): SecurityAssociation[] {
    return Array.from(this.sas.values());
  }

  // Search SAs by destination address pattern
  searchByDestination(pattern: string): SecurityAssociation[] {
    return this.getAllSAs().filter(sa => 
      sa.destinationAddress.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Get SAs by status
  getSAsByStatus(status: SecurityAssociation['status']): SecurityAssociation[] {
    return this.getAllSAs().filter(sa => sa.status === status);
  }

  // Update SA status (e.g., mark as expired)
  updateSAStatus(lookupKey: SALookupKey, status: SecurityAssociation['status']): boolean {
    const sa = this.lookupSA(lookupKey);
    if (sa) {
      sa.status = status;
      const key = this.generateKey(lookupKey.destinationAddress, lookupKey.spi);
      this.sas.set(key, sa);
      return true;
    }
    return false;
  }

  // Get database statistics
  getStats() {
    const all = this.getAllSAs();
    return {
      total: all.length,
      active: all.filter(sa => sa.status === 'active').length,
      expired: all.filter(sa => sa.status === 'expired').length,
      pending: all.filter(sa => sa.status === 'pending').length,
    };
  }
}