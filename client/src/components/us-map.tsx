import { useState, useRef, useEffect } from "react";
import { US_STATES_MAP_GRID, RATING_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StateRating {
  stateCode: string;
  averageRating: number;
  hasRatings: boolean;
}

interface USMapProps {
  stateRatings: StateRating[];
  onStateClick: (stateCode: string) => void;
  selectedState?: string | null;
}

interface TooltipState {
  visible: boolean;
  content: string;
  rating: string;
  x: number;
  y: number;
}

export function USMap({ stateRatings, onStateClick, selectedState }: USMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: "",
    rating: "",
    x: 0,
    y: 0
  });
  const mapRef = useRef<HTMLDivElement>(null);

  const getRatingColor = (stateCode: string): string => {
    const stateRating = stateRatings.find(sr => sr.stateCode === stateCode);
    if (!stateRating || !stateRating.hasRatings) {
      return RATING_COLORS[0]; // Not rated
    }
    
    const rounded = Math.round(stateRating.averageRating);
    return RATING_COLORS[rounded as keyof typeof RATING_COLORS] || RATING_COLORS[0];
  };

  const getStateRating = (stateCode: string): string => {
    const stateRating = stateRatings.find(sr => sr.stateCode === stateCode);
    if (!stateRating || !stateRating.hasRatings) {
      return "Not rated yet";
    }
    return `Combined: ${stateRating.averageRating.toFixed(1)}/10`;
  };

  const handleMouseEnter = (stateCode: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mapRect = mapRef.current?.getBoundingClientRect();
    
    if (mapRect) {
      setTooltip({
        visible: true,
        content: stateCode,
        rating: getStateRating(stateCode),
        x: rect.left - mapRect.left + rect.width / 2,
        y: rect.top - mapRect.top - 8
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mapRect = mapRef.current?.getBoundingClientRect();
    
    if (mapRect && tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: rect.left - mapRect.left + rect.width / 2,
        y: rect.top - mapRect.top - 8
      }));
    }
  };

  return (
    <div ref={mapRef} className="relative">
      <div className="grid grid-cols-12 gap-1 max-w-4xl mx-auto">
        {US_STATES_MAP_GRID.map((row, rowIndex) => 
          row.map((cell, cellIndex) => {
            if (!cell.state) {
              return (
                <div 
                  key={`${rowIndex}-${cellIndex}`} 
                  className={`col-span-${cell.span}`}
                />
              );
            }

            const stateCode = cell.state;
            const colorClass = getRatingColor(stateCode);
            const isSelected = selectedState === stateCode;

            return (
              <div
                key={`${rowIndex}-${cellIndex}`}
                className={cn(
                  `col-span-${cell.span}`,
                  "p-2 rounded text-xs font-medium text-center cursor-pointer transition-all duration-200",
                  "hover:scale-105 hover:shadow-md hover:z-10",
                  colorClass,
                  isSelected && "ring-2 ring-primary ring-offset-1",
                  stateCode === "CA" && "text-white" // California has dark green background
                )}
                onClick={() => onStateClick(stateCode)}
                onMouseEnter={(e) => handleMouseEnter(stateCode, e)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              >
                {stateCode}
              </div>
            );
          })
        )}
      </div>

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-20 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none transition-opacity duration-200",
          tooltip.visible ? "opacity-100" : "opacity-0"
        )}
        style={{
          left: tooltip.x - 60, // Center the tooltip
          top: tooltip.y - 80,
          transform: "translateX(-50%)"
        }}
      >
        <div className="font-medium">{tooltip.content}</div>
        <div className="text-gray-300">{tooltip.rating}</div>
        <div className="text-xs text-gray-400 mt-1">Click to rate</div>
      </div>

      {/* Rating Scale Legend */}
      <div className="flex items-center justify-center mt-6 space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <span className="text-gray-600">Not Rated</span>
        </div>
        <div className="flex items-center">
          <div className="w-20 h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded mr-2"></div>
          <span className="text-gray-600">1 (Poor) → 10 (Excellent)</span>
        </div>
      </div>
    </div>
  );
}
