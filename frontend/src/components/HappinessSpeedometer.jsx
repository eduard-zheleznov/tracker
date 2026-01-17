import React, { useEffect, useState } from 'react';

const HappinessSpeedometer = ({ score = null, hasData = false }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
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

  // Calculate needle rotation - 0 at left (-135°), 10 at right (135°)
  const needleRotation = hasData 
    ? -135 + (animatedScore / 10) * 270 
    : -135;

  const centerX = 150;
  const centerY = 130;
  const radius = 100;
  const strokeWidth = 18;

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

  // Generate tick marks at 0, 5, 10
  const majorTicks = [0, 5, 10].map(i => {
    const angle = -135 + (i / 10) * 270;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius + strokeWidth / 2 + 8;
    const outerR = radius + strokeWidth / 2 + 18;
    
    const x1 = centerX + innerR * Math.cos(rad);
    const y1 = centerY + innerR * Math.sin(rad);
    const x2 = centerX + outerR * Math.cos(rad);
    const y2 = centerY + outerR * Math.sin(rad);
    
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  });

  // Minor ticks
  const minorTicks = [];
  for (let i = 1; i <= 9; i++) {
    if (i === 5) continue;
    const angle = -135 + (i / 10) * 270;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius + strokeWidth / 2 + 8;
    const outerR = radius + strokeWidth / 2 + 13;
    
    const x1 = centerX + innerR * Math.cos(rad);
    const y1 = centerY + innerR * Math.sin(rad);
    const x2 = centerX + outerR * Math.cos(rad);
    const y2 = centerY + outerR * Math.sin(rad);
    
    minorTicks.push(
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

  // Calculate label positions
  const getLabelPosition = (value) => {
    const angle = -135 + (value / 10) * 270;
    const rad = (angle * Math.PI) / 180;
    const labelR = radius + strokeWidth / 2 + 30;
    return {
      x: centerX + labelR * Math.cos(rad),
      y: centerY + labelR * Math.sin(rad)
    };
  };

  const pos0 = getLabelPosition(0);
  const pos10 = getLabelPosition(10);

  return (
    <div className="flex justify-center" data-testid="happiness-speedometer">
      <svg viewBox="0 0 300 190" className="w-full max-w-[300px]">
        <defs>
          {/* Gradient for the arc - red to yellow to green */}
          <linearGradient id="speedometerGradient" gradientUnits="userSpaceOnUse" x1="50" y1="130" x2="250" y2="130">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="30%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
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
          stroke="rgba(80, 50, 120, 0.4)"
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
          filter="url(#arcGlow)"
        />

        {/* Tick marks */}
        {majorTicks}
        {minorTicks}

        {/* 0 label */}
        <text
          x={pos0.x}
          y={pos0.y + 5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="16"
          fontWeight="500"
          fontFamily="Outfit, sans-serif"
        >
          0
        </text>

        {/* 10 label */}
        <text
          x={pos10.x}
          y={pos10.y + 5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="16"
          fontWeight="500"
          fontFamily="Outfit, sans-serif"
        >
          10
        </text>

        {/* Needle */}
        <g 
          transform={`rotate(${needleRotation}, ${centerX}, ${centerY})`}
          style={{ transition: 'transform 0.6s ease-out' }}
        >
          {/* Needle line */}
          <line
            x1={centerX - 10}
            y1={centerY}
            x2={centerX + radius - 25}
            y2={centerY}
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Needle tip */}
          <polygon
            points={`${centerX + radius - 25},${centerY - 6} ${centerX + radius - 10},${centerY} ${centerX + radius - 25},${centerY + 6}`}
            fill="#FFFFFF"
          />
        </g>

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="14"
          fill="rgba(45, 25, 70, 0.9)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill="rgba(139, 92, 246, 0.8)"
        />

        {/* Score display */}
        <text
          x={centerX}
          y={centerY + 55}
          textAnchor="middle"
          fill="white"
          fontSize="38"
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
