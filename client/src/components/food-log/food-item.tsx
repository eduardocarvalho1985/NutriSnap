
import { Trash, X } from "lucide-react";
import { useState, useRef, TouchEvent } from "react";

interface FoodItemProps {
  id: string | number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function FoodItem({ 
  name, 
  quantity, 
  unit, 
  calories,
  protein,
  carbs,
  fat,
  onDelete,
  onEdit
}: FoodItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const deleteButtonWidth = 70; // Width of delete button in pixels
  
  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isSwipingRef.current = true;
  };
  
  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwipingRef.current || startXRef.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    
    // Only allow swiping left (positive diff)
    if (diff > 0) {
      // Limit max swipe to delete button width
      const newOffset = Math.min(diff, deleteButtonWidth);
      setSwipeOffset(newOffset);
    }
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    isSwipingRef.current = false;
    
    // If swiped more than halfway, snap to fully open
    if (swipeOffset > deleteButtonWidth / 2) {
      setSwipeOffset(deleteButtonWidth);
    } else {
      // Otherwise snap back
      setSwipeOffset(0);
    }
  };

  // Close swipe
  const handleCloseSwipe = () => {
    setSwipeOffset(0);
  };
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 rounded px-1"
        style={{ 
          transform: `translateX(-${swipeOffset}px)`,
          transition: isSwipingRef.current ? 'none' : 'transform 0.3s ease'
        }}
        onClick={() => {
          if (swipeOffset > 0) {
            setSwipeOffset(0);
          } else if (onEdit) {
            onEdit();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-800">{name}</span>
            <span className="text-sm font-medium ml-2">{calories} kcal</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span>{quantity} {unit}</span>
            {(protein || carbs || fat) && (
              <span className="ml-2">
                {protein ? `P: ${protein}g` : ''} 
                {carbs ? `${protein ? ' • ' : ''}C: ${carbs}g` : ''}
                {fat ? `${protein || carbs ? ' • ' : ''}G: ${fat}g` : ''}
              </span>
            )}
          </div>
        </div>
        {onDelete && swipeOffset === 0 && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering parent onClick
              onDelete();
            }}
            className="p-1 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Delete button that appears when swiped */}
      {onDelete && (
        <div 
          className="absolute top-0 right-0 bottom-0 flex items-center justify-center bg-red-500 text-white"
          style={{ 
            width: `${deleteButtonWidth}px`,
            opacity: swipeOffset / deleteButtonWidth
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            handleCloseSwipe();
          }}
        >
          <Trash className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
