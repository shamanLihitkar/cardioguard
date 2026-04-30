import React from 'react';
import './CircularProgress.css';

export default function CircularProgress({ value, size = 180, strokeWidth = 16 }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const radius = (size - strokeWidth) / 2;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * safeValue) / 100;

  const getColor = (val) => {
    if (val < 40) return 'var(--success)';
    if (val < 75) return 'var(--warning)';
    return 'var(--danger)';
  };

  const currentColor = getColor(safeValue);
  const mainFontSize = size * 0.25;
  const subFontSize = size * 0.08;

  return (
    <div className="circular-progress-wrapper" style={{ width: size, height: size }}>
      <svg className="circular-progress-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={strokeWidth} />
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          fill="none" stroke={currentColor} strokeWidth={strokeWidth} 
          strokeDasharray={dashArray} strokeDashoffset={dashOffset} 
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out' }} 
        />
      </svg>
      <div className="circular-progress-text">
        <span className="circular-progress-val" style={{ fontSize: `${mainFontSize}px` }}>
          {safeValue.toFixed(1)}
        </span>
        <span className="circular-progress-label" style={{ color: currentColor, fontSize: `${subFontSize}px` }}>
          Load
        </span>
      </div>
    </div>
  );
}