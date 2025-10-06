import React from 'react';

const SalesFunnel = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Limit to 4 stages for compact view
  const displayData = data.slice(0, 4);

  return (
    <div className="relative w-full h-[350px] flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Compact Sidekicks-inspired funnel */}
        {displayData.map((stage, index) => {
          const yStart = index * 90 + 20;
          const topWidth = Math.max(360 - (index * 50), 120);
          const bottomWidth = Math.max(360 - ((index + 1) * 50), 120);
          const xStartTop = (400 - topWidth) / 2;
          const xStartBottom = (400 - bottomWidth) / 2;
          
          // Color palette - emerald/teal shades
          const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
          const strokeColor = '#059669';
          
          return (
            <g key={index}>
              {/* Funnel segment */}
              <path
                d={`
                  M ${xStartTop} ${yStart}
                  L ${xStartTop + topWidth} ${yStart}
                  L ${xStartBottom + bottomWidth} ${yStart + 80}
                  L ${xStartBottom} ${yStart + 80}
                  Z
                `}
                fill={colors[index % colors.length]}
                stroke={strokeColor}
                strokeWidth="2"
                opacity="0.95"
              />
              
              {/* Count label */}
              <text
                x="200"
                y={yStart + 35}
                textAnchor="middle"
                className="font-bold fill-gray-900"
                style={{ fontSize: '24px', fontWeight: 'bold' }}
              >
                {stage.count?.toLocaleString() || 0}
              </text>
              
              {/* Stage name */}
              <text
                x="200"
                y={yStart + 58}
                textAnchor="middle"
                className="font-medium fill-gray-800"
                style={{ fontSize: '13px', fontWeight: '500' }}
              >
                {stage.stage}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SalesFunnel;