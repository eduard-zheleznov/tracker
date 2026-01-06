import React, { useEffect, useState } from 'react';

const HappinessSpeedometer = ({ score = null, hasData = false }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Animate the needle
  useEffect(() => {
    if (score !== null && hasData) {
      const targetScore = Math.min(10, Math.max(0, score));
      let current = 0;
      const step = targetScore / 30;
      const interval = setInterval(() => {
        current += step;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setAnimatedScore(0);
    }
  }, [score, hasData]);

  // Calculate needle rotation (0 = -135deg, 10 = 135deg)
  const needleRotation = hasData 
    ? -135 + (animatedScore / 10) * 270 
    : -135;

  // SVG arc parameters
  const centerX = 160;
  const centerY = 150;
  const radius = 120;

  // Create arc path
  const createArc = (startAngle, endAngle, r) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + r * Math.cos(startRad);
    const y1 = centerY + r * Math.sin(startRad);
    const x2 = centerX + r * Math.cos(endRad);
    const y2 = centerY + r * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = -135 + (i / 10) * 270;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - 15;
    const outerR = radius - 5;
    
    const x1 = centerX + innerR * Math.cos(rad);
    const y1 = centerY + innerR * Math.sin(rad);
    const x2 = centerX + outerR * Math.cos(rad);
    const y2 = centerY + outerR * Math.sin(rad);
    
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="speedometer-container" data-testid="happiness-speedometer">
      <svg viewBox="0 0 320 200" className="w-full">
        <defs>
          {/* Gradient for the arc */}
          <linearGradient id="speedometerGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="35%" stopColor="#F97316" />
            <stop offset="65%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          
          {/* Shadow filter for glow effect */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background arc track */}
        <path
          d={createArc(-135, 135, radius)}
          fill="none"
          stroke="rgba(62, 44, 90, 0.5)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Colored arc */}
        <path
          d={createArc(-135, 135, radius)}
          fill="none"
          stroke="url(#speedometerGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Tick marks */}
        {ticks}

        {/* 0 label */}
        <text
          x="45"
          y="185"
          fill="rgba(255,255,255,0.7)"
          fontSize="16"
          fontFamily="Inter, sans-serif"
        >
          0
        </text>

        {/* 10 label */}
        <text
          x="265"
          y="185"
          fill="rgba(255,255,255,0.7)"
          fontSize="16"
          fontFamily="Inter, sans-serif"
        >
          10
        </text>

        {/* Needle */}
        <g 
          transform={`rotate(${needleRotation}, ${centerX}, ${centerY})`}
          style={{ transition: 'transform 0.5s ease-out' }}
        >
          {/* Needle body */}
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + radius - 25}
            y2={centerY}
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Needle cap */}
          <circle
            cx={centerX}
            cy={centerY}
            r="10"
            fill="#1F1135"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </g>

        {/* Score display */}
        <text
          x={centerX}
          y={centerY + 50}
          textAnchor="middle"
          fill="white"
          fontSize="48"
          fontWeight="bold"
          fontFamily="Outfit, sans-serif"
          data-testid="happiness-score-value"
        >
          {hasData ? score?.toFixed(1).replace('.', ',') : '—'}
        </text>
      </svg>
    </div>
  );
};

export default HappinessSpeedometer;
