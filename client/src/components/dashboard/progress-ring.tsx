import { useEffect, useRef } from "react";

interface ProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  percentage,
  size,
  strokeWidth,
  color,
  backgroundColor = "transparent",
  children
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  
  // Calculate circle properties
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Set the progress
  useEffect(() => {
    if (!circleRef.current) return;
    
    const offset = circumference - (percentage / 100) * circumference;
    circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
    circleRef.current.style.strokeDashoffset = `${offset}`;
  }, [percentage, circumference]);

  return (
    <div className="relative flex items-center justify-center">
      <svg 
        className="progress-ring" 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle 
          className="progress-ring__circle" 
          stroke={backgroundColor} 
          cx={center} 
          cy={center} 
          r={radius} 
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle 
          ref={circleRef}
          className="progress-ring__circle" 
          stroke={color} 
          cx={center} 
          cy={center} 
          r={radius} 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute text-center">
        {children}
      </div>
    </div>
  );
}
