import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SecurityAssociation } from '../types/SA';

interface SAFormProps {
  onAddSA: (sa: Omit<SecurityAssociation, 'createdAt'>) => boolean;
}

export const SAForm: React.FC<SAFormProps> = ({ onAddSA }) => {
  const [formData, setFormData] = useState({
    destinationAddress: '',
    spi: '',
    protocol: 'ESP' as SecurityAssociation['protocol'],
    algorithm: '',
    key: '',
    lifetime: '',
    status: 'active' as SecurityAssociation['status']
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate destination address (basic IP format)
    const addressRegex = /^(https?:\/\/)?(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?$/;

if (!formData.destinationAddress) {
  newErrors.destinationAddress = "Destination address is required";
} else if (!addressRegex.test(formData.destinationAddress)) {
  newErrors.destinationAddress = "Invalid destination address format";
}


    // Validate SPI
    const spiNum = parseInt(formData.spi);
    if (!formData.spi) {
      newErrors.spi = 'SPI is required';
    } else if (isNaN(spiNum) || spiNum < 256 || spiNum > 4294967295) {
      newErrors.spi = 'SPI must be between 256 and 4294967295';
    }

    // Validate algorithm
    if (!formData.algorithm.trim()) {
      newErrors.algorithm = 'Algorithm is required';
    }

    // Validate key
    // Strong base pattern
const strongKeyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

if (!formData.key.trim()) {
  newErrors.key = 'Security key is required';

} else if (!strongKeyRegex.test(formData.key)) {
  newErrors.key =
    'Key must be at least 8 characters and include uppercase, lowercase, number, and special character';

} else if (/(.)\1\1/.test(formData.key)) {
  newErrors.key = 'Key cannot contain triple repeated characters (e.g., aaa, 111)';

} else {
  const key = formData.key;
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = lower.toUpperCase();
  const nums = "0123456789";

  let hasSequence = false;

  for (let i = 0; i < key.length - 2; i++) {
    const part = key.slice(i, i + 3);

    if (lower.includes(part) || upper.includes(part) || nums.includes(part)) {
      hasSequence = true;
      break;
    }
  }

  if (hasSequence) {
    newErrors.key = 'Key cannot contain sequential patterns like abc, ABC, 123';
  }
}


    // Validate lifetime
    const lifetimeNum = parseInt(formData.lifetime);
    if (!formData.lifetime) {
      newErrors.lifetime = 'Lifetime is required';
    } else if (isNaN(lifetimeNum) || lifetimeNum <= 0) {
      newErrors.lifetime = 'Lifetime must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newSA: Omit<SecurityAssociation, 'createdAt'> = {
      destinationAddress: formData.destinationAddress,
      spi: parseInt(formData.spi),
      protocol: formData.protocol,
      algorithm: formData.algorithm,
      key: formData.key,
      lifetime: parseInt(formData.lifetime),
      status: formData.status
    };

    const success = onAddSA(newSA);
    
    if (success) {
      // Reset form on success
      setFormData({
        destinationAddress: '',
        spi: '',
        protocol: 'ESP',
        algorithm: '',
        key: '',
        lifetime: '',
        status: 'active'
      });
      setErrors({});
    } else {
      setErrors({ general: 'SA with this destination address and SPI already exists' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-blue-600" />
        Add New Security Association
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {errors.general && (
          <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Address *
          </label>
          <input
            type="text"
            value={formData.destinationAddress}
            onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
            placeholder="192.168.1.1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.destinationAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.destinationAddress && (
            <p className="text-red-500 text-xs mt-1">{errors.destinationAddress}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SPI (Security Parameter Index) *
          </label>
          <input
            type="number"
            value={formData.spi}
            onChange={(e) => handleInputChange('spi', e.target.value)}
            placeholder="256"
            min="256"
            max="4294967295"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.spi ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.spi && (
            <p className="text-red-500 text-xs mt-1">{errors.spi}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Protocol *
          </label>
          <select
            value={formData.protocol}
            onChange={(e) => handleInputChange('protocol', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="ESP">ESP (Encapsulating Security Payload)</option>
            <option value="AH">AH (Authentication Header)</option>
          </select>
        </div>

       <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Algorithm *
  </label>

  <select
    value={formData.algorithm}
    onChange={(e) => handleInputChange('algorithm', e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      errors.algorithm ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`}
  >
    <option value="">-- Select Algorithm --</option>
    <option value="AES-128">AES-128</option>
    <option value="AES-256">AES-256</option>
    <option value="SHA-256">SHA-256</option>
    <option value="SHA-512">SHA-512</option>
  </select>

  {errors.algorithm && (
    <p className="text-red-500 text-xs mt-1">{errors.algorithm}</p>
  )}
</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Key *
          </label>
          <input
            type="password"
            value={formData.key}
            onChange={(e) => handleInputChange('key', e.target.value)}
            placeholder="Enter security key"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.key ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.key && (
            <p className="text-red-500 text-xs mt-1">{errors.key}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lifetime (seconds) *
          </label>
          <input
            type="number"
            value={formData.lifetime}
            onChange={(e) => handleInputChange('lifetime', e.target.value)}
            placeholder="3600"
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.lifetime ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.lifetime && (
            <p className="text-red-500 text-xs mt-1">{errors.lifetime}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Security Association
          </button>
        </div>
      </form>
    </div>
  );
};
