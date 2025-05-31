import { Beef, Wheat, Droplets } from "lucide-react";

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroProgress({ label, current, target, unit, color }: MacroProgressProps) {
  // Round numbers to 1 decimal place max
  const roundedCurrent = Math.round(current * 10) / 10;
  const roundedTarget = Math.round(target * 10) / 10;
  
  // Calculate percentage for the circle
  const percentage = Math.min((roundedCurrent / roundedTarget) * 100, 100);
  const circumference = 2 * Math.PI * 16; // radius of 16
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get icon based on macro type
  const getIcon = () => {
    switch (label.toLowerCase()) {
      case 'proteína':
        return <Beef className="h-4 w-4" />;
      case 'carbs':
        return <Wheat className="h-4 w-4" />;
      case 'gordura':
        return <Droplets className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get color classes based on macro type
  const getColorClasses = () => {
    switch (label.toLowerCase()) {
      case 'proteína':
        return {
          stroke: 'stroke-blue-500',
          text: 'text-blue-600',
          bg: 'bg-blue-50'
        };
      case 'carbs':
        return {
          stroke: 'stroke-amber-500',
          text: 'text-amber-600',
          bg: 'bg-amber-50'
        };
      case 'gordura':
        return {
          stroke: 'stroke-red-500',
          text: 'text-red-600',
          bg: 'bg-red-50'
        };
      default:
        return {
          stroke: 'stroke-primary',
          text: 'text-primary',
          bg: 'bg-primary/10'
        };
    }
  };

  const colorClasses = getColorClasses();
  
  return (
    <div className={`flex flex-col items-center space-y-3 p-4 rounded-2xl ${colorClasses.bg} border border-slate-200/50`}>
      {/* Circular Progress */}
      <div className="relative">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background Circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-white/80"
            strokeWidth="4"
          />
          {/* Progress Circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className={colorClasses.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        {/* Icon in center */}
        <div className={`absolute inset-0 flex items-center justify-center ${colorClasses.text}`}>
          {getIcon()}
        </div>
      </div>
      
      {/* Label and Values */}
      <div className="text-center">
        <p className={`text-sm font-bold ${colorClasses.text} uppercase tracking-wider`}>
          {label}
        </p>
        <p className="text-lg font-bold text-slate-800 mt-1">
          {roundedCurrent}{unit}
        </p>
        <p className="text-sm text-slate-600 font-medium">
          de {roundedTarget}{unit}
        </p>
      </div>
    </div>
  );
}
