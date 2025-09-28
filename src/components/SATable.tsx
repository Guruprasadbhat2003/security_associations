import React from 'react';
import { Trash2, Shield, Clock, AlertCircle, Link, CheckCircle, XCircle } from 'lucide-react';
import { SecurityAssociation, SALookupKey } from '../types/SA';

interface SATableProps {
  sas: SecurityAssociation[];
  onDeleteSA: (lookupKey: SALookupKey) => void;
  onStatusChange: (lookupKey: SALookupKey, status: SecurityAssociation['status']) => void;
}

export const SATable: React.FC<SATableProps> = ({ sas, onDeleteSA, onStatusChange }) => {
  const getStatusBadge = (status: SecurityAssociation['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Shield className="w-3 h-3" />
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const formatLifetime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const handleDelete = (sa: SecurityAssociation) => {
    if (window.confirm(`Delete SA for ${sa.destinationAddress}:${sa.spi}?`)) {
      onDeleteSA({ destinationAddress: sa.destinationAddress, spi: sa.spi });
    }
  };

  if (sas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No Security Associations found</p>
        <p className="text-gray-400 text-sm mt-2">Add your first SA using the form above</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SPI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Protocol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Algorithm
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lifetime
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blockchain
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sas.map((sa) => (
              <tr key={`${sa.destinationAddress}:${sa.spi}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sa.destinationAddress}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{sa.spi}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    sa.protocol === 'ESP' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {sa.protocol}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sa.algorithm}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatLifetime(sa.lifetime)}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <select
                    value={sa.status}
                    onChange={(e) => onStatusChange(
                      { destinationAddress: sa.destinationAddress, spi: sa.spi },
                      e.target.value as SecurityAssociation['status']
                    )}
                    className="text-xs border-none bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>
                  {getStatusBadge(sa.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(sa.createdAt)}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {sa.blockchainVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                    {sa.blockchainTxHash && (
                      <Link 
                        className="w-3 h-3 text-blue-500 cursor-pointer" 
                        title={`TX: ${sa.blockchainTxHash.substring(0, 8)}...`}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(sa)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete SA"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};