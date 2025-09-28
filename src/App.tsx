import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Database, Lock, AlertCircle } from 'lucide-react';
import { SADatabaseService } from './utils/SADatabaseService';
import { SAForm } from './components/SAForm';
import { SATable } from './components/SATable';
import { SASearch } from './components/SASearch';
import { BlockchainStatus } from './components/BlockchainStatus';
import { SecurityAssociation, SALookupKey, DatabaseStats } from './types/SA';

function App() {
  const [saService] = useState(() => new SADatabaseService());
  const [sas, setSas] = useState<SecurityAssociation[]>([]);
  const [stats, setStats] = useState<DatabaseStats>({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0,
    blockchainVerified: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SecurityAssociation['status'] | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Load SAs from database
  const refreshSAs = async () => {
    try {
      setLoading(true);
      const result = await saService.getAllSAs();
      if (result.success && result.sas) {
        setSas(result.sas);
        setSupabaseConnected(true);
      } else {
        setError(result.error || 'Failed to load SAs');
      }

      const statsResult = await saService.getStats();
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (err) {
      setError('Database connection failed. Please set up Supabase.');
      setSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    refreshSAs();
  }, []);

  // Handle adding new SA
  const handleAddSA = async (sa: Omit<SecurityAssociation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await saService.addSA(sa);
    if (result.success) {
      refreshSAs();
    }
    return result.success;
  };

  // Handle deleting SA
  const handleDeleteSA = async (lookupKey: SALookupKey) => {
    const result = await saService.deleteSA(lookupKey);
    if (result.success) {
      refreshSAs();
    }
  };

  // Handle status change
  const handleStatusChange = async (lookupKey: SALookupKey, status: SecurityAssociation['status']) => {
    const result = await saService.updateSAStatus(lookupKey, status);
    if (result.success) {
      refreshSAs();
    }
  };

  // Filter and search SAs
  const filteredSAs = useMemo(() => {
    let filtered = sas;

    // Filter by search term
    if (searchTerm) {
      filtered = sas.filter(sa => 
        sa.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sa => sa.status === statusFilter);
    }

    return filtered;
  }, [sas, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Security Association Database
                </h1>
                <p className="text-sm text-gray-500">IPSec SA Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                <span>{stats.total} SAs</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-green-600" />
                <span>{stats.active} Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Database Connection Status */}
      {!supabaseConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-yellow-700">
                <strong>Database not connected.</strong> Please set up Supabase by clicking the settings icon above the preview.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blockchain Status */}
        {supabaseConnected && <BlockchainStatus saService={saService} />}

        {/* Add SA Form */}
        {supabaseConnected && <SAForm onAddSA={handleAddSA} />}

        {/* Search and Filter */}
        {supabaseConnected && (
          <SASearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            stats={stats}
          />
        )}

        {/* SA Table */}
        {supabaseConnected && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Security Associations
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredSAs.length} of {stats.total})
                </span>
              </h2>
            </div>
            
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading Security Associations...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <SATable
                sas={filteredSAs}
                onDeleteSA={handleDeleteSA}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        )}

        {/* Database Info */}
        {supabaseConnected && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 text-sm font-medium">Total SAs</div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium">Active</div>
              <div className="text-2xl font-bold text-green-900">{stats.active}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-yellow-600 text-sm font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-red-600 text-sm font-medium">Expired</div>
              <div className="text-2xl font-bold text-red-900">{stats.expired}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 text-sm font-medium">Blockchain Verified</div>
              <div className="text-2xl font-bold text-purple-900">{stats.blockchainVerified}</div>
            </div>
          </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            Security Association Database - IPSec Management System
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;