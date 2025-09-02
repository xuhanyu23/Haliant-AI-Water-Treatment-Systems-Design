interface CatalogItem {
  key: string;
  item: string;
  spec: string;
  unitCost: number;
  vendor?: string;
  leadTime?: string;
}

// Simple in-memory catalog with typical water treatment equipment costs
const catalog: CatalogItem[] = [
  // Pumps
  {
    key: 'pump-goulds-esh',
    item: 'Pump',
    spec: 'Goulds e-SH',
    unitCost: 8500,
    vendor: 'Goulds Pumps',
    leadTime: '4-6 weeks'
  },
  
  // Tanks
  {
    key: 'tank-316ss-cone',
    item: 'CIP Tank',
    spec: '316SS cone-bottom',
    unitCost: 45, // per gallon
    vendor: 'Various',
    leadTime: '6-8 weeks'
  },
  
  // Heaters
  {
    key: 'heater-electric-immersion',
    item: 'Heater',
    spec: 'Electric immersion',
    unitCost: 250, // per kW
    vendor: 'Various',
    leadTime: '2-4 weeks'
  },
  
  // Filter Housings
  {
    key: 'filter-housing-30round',
    item: 'Cartridge Filter Housing',
    spec: '30-round',
    unitCost: 1200,
    vendor: 'Various',
    leadTime: '2-3 weeks'
  },
  
  // Filter Cartridges
  {
    key: 'filter-cartridge-30inch',
    item: 'Filter Cartridges',
    spec: '30" 5 µm absolute',
    unitCost: 45,
    vendor: 'Various',
    leadTime: '1-2 weeks'
  },
  
  // Flowmeters
  {
    key: 'flowmeter-mag',
    item: 'Mag Flowmeter',
    spec: '0–300 gpm',
    unitCost: 1800,
    vendor: 'Various',
    leadTime: '2-3 weeks'
  },
  
  // Pressure Gauges
  {
    key: 'pressure-gauge',
    item: 'Pressure Gauges/Transmitters',
    spec: 'Feed & return headers',
    unitCost: 150,
    vendor: 'Various',
    leadTime: '1-2 weeks'
  },
  
  // Valves & Piping
  {
    key: 'valves-piping-316l',
    item: 'Valves & Piping',
    spec: '316L SS headers',
    unitCost: 85, // per linear foot
    vendor: 'Various',
    leadTime: '3-4 weeks'
  },
  
  // Controls
  {
    key: 'controls-plc-hmi',
    item: 'Controls (PLC + HMI)',
    spec: 'Recipe selector, permissives, logging',
    unitCost: 8500,
    vendor: 'Various',
    leadTime: '6-8 weeks'
  }
];

// Fuzzy matching function
function fuzzyMatch(item: string, spec: string, catalogItem: CatalogItem): number {
  const itemScore = item.toLowerCase().includes(catalogItem.item.toLowerCase()) ? 1 : 0;
  const specScore = spec.toLowerCase().includes(catalogItem.spec.toLowerCase()) ? 1 : 0;
  
  // Additional keyword matching
  const keywords = ['pump', 'tank', 'heater', 'filter', 'flowmeter', 'pressure', 'valve', 'control'];
  const keywordScore = keywords.some(keyword => 
    spec.toLowerCase().includes(keyword) && catalogItem.spec.toLowerCase().includes(keyword)
  ) ? 0.5 : 0;
  
  return itemScore + specScore + keywordScore;
}

// Find best matching catalog item
export function findCatalogItem(item: string, spec: string): CatalogItem | null {
  let bestMatch: CatalogItem | null = null;
  let bestScore = 0;
  
  for (const catalogItem of catalog) {
    const score = fuzzyMatch(item, spec, catalogItem);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = catalogItem;
    }
  }
  
  // Only return match if score is above threshold
  return bestScore >= 1.5 ? bestMatch : null;
}

// Calculate unit cost for a BOM item
export function calculateUnitCost(item: string, spec: string, qty: number): { unitCost: number | null, extendedCost: number | null } {
  const catalogItem = findCatalogItem(item, spec);
  
  if (!catalogItem) {
    return { unitCost: null, extendedCost: null };
  }
  
  let unitCost = catalogItem.unitCost;
  
  // Apply quantity discounts for certain items
  if (item.toLowerCase().includes('tank') && qty > 1) {
    unitCost = unitCost * 0.9; // 10% discount for larger tanks
  }
  
  if (item.toLowerCase().includes('filter') && qty > 10) {
    unitCost = unitCost * 0.85; // 15% discount for bulk filters
  }
  
  const extendedCost = unitCost * qty;
  
  return { unitCost, extendedCost };
}

// Get catalog for reference
export function getCatalog(): CatalogItem[] {
  return [...catalog];
}
