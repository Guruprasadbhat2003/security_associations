import React from 'react';
import { Search, Filter } from 'lucide-react';
import { SecurityAssociation } from '../types/SA';

interface SASearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: SecurityAssociation['status'] | 'all';
  onStatusFilterChange: (status: SecurityAssociation['status'] | 'all') => void;
  stats: {
    total: number;
    active: number;
    expired: number;
    pending: number;
    blockchainVerified: number;
  };
}

export const SASearch: React.FC<SASearchProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stats
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by destination address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as SecurityAssociation['status'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Status ({stats.total})</option>
              <option value="active">Active ({stats.active})</option>
              <option value="expired">Expired ({stats.expired})</option>
              <option value="pending">Pending ({stats.pending})</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded-full border border-green-300"></div>
          Active: {stats.active}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 rounded-full border border-red-300"></div>
          Expired: {stats.expired}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 rounded-full border border-yellow-300"></div>
          Pending: {stats.pending}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 rounded-full border border-blue-300"></div>
          Blockchain Verified: {stats.blockchainVerified}
        </span>
      </div>
    </div>
  );
};