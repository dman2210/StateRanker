export const US_STATES_MAP_GRID = [
  // Row 1 (Alaska, Hawaii in top right)
  [
    { state: null, span: 2 },
    { state: null, span: 8 },
    { state: "AK", span: 1 },
    { state: "HI", span: 1 }
  ],
  // Row 2 (Northern States)
  [
    { state: "WA", span: 1 },
    { state: "ID", span: 1 },
    { state: "MT", span: 1 },
    { state: "ND", span: 1 },
    { state: "MN", span: 1 },
    { state: "WI", span: 1 },
    { state: "MI", span: 1 },
    { state: "NY", span: 1 },
    { state: "VT", span: 1 },
    { state: "NH", span: 1 },
    { state: "ME", span: 1 },
    { state: null, span: 1 }
  ],
  // Row 3
  [
    { state: "OR", span: 1 },
    { state: "NV", span: 1 },
    { state: "WY", span: 1 },
    { state: "SD", span: 1 },
    { state: "IA", span: 1 },
    { state: "IL", span: 1 },
    { state: "IN", span: 1 },
    { state: "OH", span: 1 },
    { state: "PA", span: 1 },
    { state: "NJ", span: 1 },
    { state: "CT", span: 1 },
    { state: "RI", span: 1 }
  ],
  // Row 4
  [
    { state: "CA", span: 1 },
    { state: "UT", span: 1 },
    { state: "CO", span: 1 },
    { state: "NE", span: 1 },
    { state: "MO", span: 1 },
    { state: "KY", span: 1 },
    { state: "WV", span: 1 },
    { state: "VA", span: 1 },
    { state: "MD", span: 1 },
    { state: "DE", span: 1 },
    { state: "MA", span: 1 },
    { state: null, span: 1 }
  ],
  // Row 5
  [
    { state: null, span: 1 },
    { state: "AZ", span: 1 },
    { state: "NM", span: 1 },
    { state: "KS", span: 1 },
    { state: "AR", span: 1 },
    { state: "TN", span: 1 },
    { state: "NC", span: 1 },
    { state: "SC", span: 1 },
    { state: null, span: 4 }
  ],
  // Row 6 (Southern States)
  [
    { state: null, span: 2 },
    { state: "TX", span: 1 },
    { state: "OK", span: 1 },
    { state: "LA", span: 1 },
    { state: "MS", span: 1 },
    { state: "AL", span: 1 },
    { state: "GA", span: 1 },
    { state: "FL", span: 1 },
    { state: null, span: 3 }
  ]
];

export const RATING_COLORS = {
  0: "bg-gray-300", // Not rated
  1: "bg-red-500",
  2: "bg-red-400",
  3: "bg-orange-500",
  4: "bg-orange-400",
  5: "bg-yellow-500",
  6: "bg-yellow-400",
  7: "bg-lime-500",
  8: "bg-lime-400",
  9: "bg-green-400",
  10: "bg-green-500"
};

export const RATING_LABELS = {
  "1-2": { color: "bg-red-500", label: "Poor" },
  "3-4": { color: "bg-orange-500", label: "Fair" },
  "5-6": { color: "bg-yellow-500", label: "Good" },
  "7-8": { color: "bg-lime-500", label: "Great" },
  "9-10": { color: "bg-green-500", label: "Excellent" }
};
