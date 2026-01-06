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

  // SVG parameters - corrected geometry to match design
  const centerX = 150;
  const centerY = 140;
  const radius = 110;
  const strokeWidth = 22;

  // Create arc path for semi-circle (from -135 to 135 degrees)
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
    const innerR = radius + strokeWidth / 2 + 5;
    const outerR = radius + strokeWidth / 2 + 12;
    
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
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="speedometer-container" data-testid="happiness-speedometer">
      <svg viewBox="0 0 300 200" className="w-full max-w-[320px] mx-auto">
        <defs>
          {/* Gradient for the arc - matching design colors */}
          <linearGradient id="speedometerGradient" gradientUnits="userSpaceOnUse" x1="40" y1="140" x2="260" y2="140">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="25%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="75%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Drop shadow for needle */}
          <filter id="needleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
          </filter>
        </defs>

        {/* Background arc track */}
        <path
          d={createArc(-135, 135, radius)}
          fill="none"
          stroke="rgba(62, 44, 90, 0.6)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored gradient arc */}
        <path
          d={createArc(-135, 135, radius)}
          fill="none"
          stroke="url(#speedometerGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Tick marks */}
        {ticks}

        {/* 0 label */}
        <text
          x="32"
          y="175"
          fill="rgba(255,255,255,0.6)"
          fontSize="14"
          fontFamily="Inter, sans-serif"
        >
          0
        </text>

        {/* 10 label */}
        <text
          x="258"
          y="175"
          fill="rgba(255,255,255,0.6)"
          fontSize="14"
          fontFamily="Inter, sans-serif"
        >
          10
        </text>

        {/* Needle */}
        <g 
          transform={`rotate(${needleRotation}, ${centerX}, ${centerY})`}
          style={{ transition: 'transform 0.6s ease-out' }}
          filter="url(#needleShadow)"
        >
          {/* Needle body - thin red line like in design */}
          <line
            x1={centerX - 15}
            y1={centerY}
            x2={centerX + radius - 30}
            y2={centerY}
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Needle center cap */}
          <circle
            cx={centerX}
            cy={centerY}
            r="12"
            fill="#1F1135"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="6"
            fill="#3E2C5A"
          />
        </g>

        {/* Score display */}
        <text
          x={centerX}
          y={centerY + 55}
          textAnchor="middle"
          fill="white"
          fontSize="42"
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
