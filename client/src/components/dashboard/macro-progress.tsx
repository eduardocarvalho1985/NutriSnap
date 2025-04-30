interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroProgress({ label, current, target, unit, color }: MacroProgressProps) {
  // Calculate percentage
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="text-center">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs font-semibold text-gray-700 uppercase">
            {label}
          </div>
          <div className="text-xs font-semibold text-gray-700">
            {current}/{target}{unit}
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
          <div 
            style={{ width: `${percentage}%` }} 
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${color}`}>
          </div>
        </div>
      </div>
    </div>
  );
}
