import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Database, Link } from 'lucide-react';
import { SADatabaseService } from '../utils/SADatabaseService';

interface BlockchainStatusProps {
  saService: SADatabaseService;
}

export const BlockchainStatus: React.FC<BlockchainStatusProps> = ({ saService }) => {
  const [isValid, setIsValid] = useState<boolean>(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkIntegrity = () => {
      const valid = saService.verifyBlockchainIntegrity();
      setIsValid(valid);
      setLastCheck(new Date());
    };

    checkIntegrity();
    const interval = setInterval(checkIntegrity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [saService]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <Link className={`w-5 h-5 ${isValid ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Blockchain Status</h3>
            <p className="text-sm text-gray-500">
              Last verified: {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isValid ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Integrity Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Integrity Compromised</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Database</span>
          </div>
          <p className="text-xs text-blue-600">
            Supabase PostgreSQL with RLS enabled for secure data storage
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Blockchain</span>
          </div>
          <p className="text-xs text-purple-600">
            Immutable audit trail with SHA-256 hashing and proof-of-work
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Security</span>
          </div>
          <p className="text-xs text-green-600">
            Keys hashed with SHA-256, never stored in plain text
          </p>
        </div>
      </div>
    </div>
  );
};