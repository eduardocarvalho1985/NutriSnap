import React, { useState, useRef, useEffect } from "react";
import { ChevronRightIcon, Trash2Icon } from "lucide-react";

type FoodItemProps = {
  food: Food;
  onEditFood: (food: Food) => void;
  onDeleteFood?: (food: Food) => void;
};

export function FoodItem({ food, onEditFood, onDeleteFood }: FoodItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;

    // Only allow swiping left (negative values)
    if (diff < 0) {
      // Limit swipe to -80px
      const newOffset = Math.max(diff, -80);
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    // If swiped more than halfway, snap to delete button width (-80px)
    // Otherwise snap back to original position
    if (swipeOffset < -40) {
      setSwipeOffset(-80);
    } else {
      setSwipeOffset(0);
    }
  };

  // Reset swipe position when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node) && swipeOffset !== 0) {
        setSwipeOffset(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [swipeOffset]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteFood) {
      onDeleteFood(food);
    }
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden" ref={itemRef}>
      {/* Delete button (positioned behind the item) */}
      <div 
        className="absolute right-0 top-0 h-full flex items-center justify-center bg-red-500 text-white"
        style={{ width: '80px' }}
      >
        <button 
          className="h-full w-full flex items-center justify-center"
          onClick={handleDelete}
        >
          <Trash2Icon className="h-5 w-5" />
        </button>
      </div>

      {/* Main food item content */}
      <div 
        className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-md px-1 bg-white"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease'
        }}
        onClick={() => onEditFood(food)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-800">{food.name}</h4>
          <div className="flex text-xs text-gray-500 mt-0.5">
            <span>{food.quantity} {food.unit}</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-600 mr-1">{food.calories} kcal</span>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}