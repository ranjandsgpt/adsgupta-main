export type FloorTier = {
  floor: number;
  estimatedFillRate: number;
  estimatedRevenuePer1000: number;
  bidCount: number;
};

export type FloorAnalysis = {
  adUnitId: string;
  adUnitName: string;
  currentFloor: number;
  currentFillRate: number;
  currentRevenuePer1000: number;
  optimalFloor: number;
  optimalFillRate: number;
  optimalRevenuePer1000: number;
  revenueUplift: number;
  tiers: FloorTier[];
  recommendation: string;
};
