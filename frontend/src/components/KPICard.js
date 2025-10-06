import React from 'react';

const KPICard = ({ title, value, trend, icon, color = 'blue', compact = false }) => {
  const isPositive = trend >= 0;

  if (compact) {
    // Sidekicks-style compact card - smaller
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    );
  }

  // Standard card
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600', 
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
            <span className="text-xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;