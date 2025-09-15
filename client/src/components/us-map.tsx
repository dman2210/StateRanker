import { useState } from "react";
import { USAMap } from "@mirawision/usa-map-react";
import { RATING_COLORS } from "@/lib/constants";
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

export function USMap({ stateRatings, onStateClick, selectedState }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Convert CSS classes to hex colors for the SVG map
  const getRatingColor = (stateCode: string): string => {
    const stateRating = stateRatings.find(sr => sr.stateCode === stateCode);
    if (!stateRating || !stateRating.hasRatings) {
      return "#d1d5db"; // gray-300
    }
    
    const rounded = Math.round(stateRating.averageRating);
    const colorMap: { [key: number]: string } = {
      0: "#d1d5db", // gray-300 - Not rated
      1: "#ef4444", // red-500
      2: "#f87171", // red-400
      3: "#f97316", // orange-500
      4: "#fb923c", // orange-400
      5: "#eab308", // yellow-500
      6: "#facc15", // yellow-400
      7: "#84cc16", // lime-500
      8: "#a3e635", // lime-400
      9: "#4ade80", // green-400
      10: "#22c55e"  // green-500
    };
    return colorMap[rounded] || colorMap[0];
  };

  function getStateRating(stateCode: string): string {
    const stateRating = stateRatings.find(sr => sr.stateCode === stateCode);
    if (!stateRating || !stateRating.hasRatings) {
      return "Not rated yet";
    }
    return `Combined: ${stateRating.averageRating.toFixed(1)}/10`;
  }

  function handleMouseOver(stateAbbreviation: string) {
    setHoveredState(stateAbbreviation);
  }

  function handleMouseOut() {
    setHoveredState(null);
  }

  // Create customization object for the map
  const allStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const stateCustomization = allStates.reduce((acc, state) => {
    acc[state] = {
      fill: getRatingColor(state),
      stroke: selectedState === state ? "#3b82f6" : "#374151",
      strokeWidth: selectedState === state ? 3 : 1,
      onClick: () => onStateClick(state),
      onHover: () => handleMouseOver(state),
      onLeave: handleMouseOut
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="relative w-full">
      <div className="w-full max-w-4xl mx-auto">
        <USAMap
          customStates={stateCustomization}
          mapSettings={{
            width: "100%",
            height: "500"
          }}
        />
      </div>

      {/* Simple tooltip using built-in tooltips from the library or minimal display */}
      {hoveredState && (
        <div className="fixed top-4 right-4 z-20 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none">
          <div className="font-medium">{hoveredState}</div>
          <div className="text-gray-300">{getStateRating(hoveredState)}</div>
          <div className="text-xs text-gray-400 mt-1">Click to rate</div>
        </div>
      )}

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
