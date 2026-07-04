export interface MappingEntry {
  clientType: string;
  industry: string;
}

export const CLIENT_INDUSTRY_MAPPING: MappingEntry[] = [
  // Individual
  { clientType: "Individual", industry: "Residential" },
  { clientType: "Individual", industry: "Commercial" },
  { clientType: "Individual", industry: "Agriculture" },
  
  // Business
  { clientType: "Business", industry: "Commercial" },
  { clientType: "Business", industry: "Retail" },
  { clientType: "Business", industry: "Hospitality" },
  { clientType: "Business", industry: "Healthcare" },
  { clientType: "Business", industry: "Education" },
  { clientType: "Business", industry: "Manufacturing" },
  { clientType: "Business", industry: "Warehouse & Logistics" },
  { clientType: "Business", industry: "Data Center" },
  { clientType: "Business", industry: "Banking & Finance" },
  { clientType: "Business", industry: "Food & Beverage" },
  { clientType: "Business", industry: "Pharmaceuticals" },
  { clientType: "Business", industry: "Telecommunications" },
  { clientType: "Business", industry: "Entertainment" },
  { clientType: "Business", industry: "Religious" },
  { clientType: "Business", industry: "Agriculture" },
  { clientType: "Business", industry: "Oil & Gas" },
  { clientType: "Business", industry: "Transportation" },

  // Government
  { clientType: "Government", industry: "Government" },
  { clientType: "Government", industry: "Healthcare" },
  { clientType: "Government", industry: "Education" },
  { clientType: "Government", industry: "Transportation" },
  { clientType: "Government", industry: "Hospitality" },
  { clientType: "Government", industry: "Commercial" },
  { clientType: "Government", industry: "Data Center" },

  // Builder / Developer
  { clientType: "Builder / Developer", industry: "Real Estate" },
  { clientType: "Builder / Developer", industry: "Construction" },
  { clientType: "Builder / Developer", industry: "Hospitality" },
  { clientType: "Builder / Developer", industry: "Healthcare" },
  { clientType: "Builder / Developer", industry: "Education" },
  { clientType: "Builder / Developer", industry: "Industrial" },

  // Contractor
  { clientType: "Contractor", industry: "Construction" },
  { clientType: "Contractor", industry: "Commercial" },
  { clientType: "Contractor", industry: "Industrial" },
  { clientType: "Contractor", industry: "Healthcare" },
  { clientType: "Contractor", industry: "Hospitality" },
  { clientType: "Contractor", industry: "Education" },
  { clientType: "Contractor", industry: "Government" },

  // Consultant
  { clientType: "Consultant", industry: "Construction" },
  { clientType: "Consultant", industry: "Commercial" },
  { clientType: "Consultant", industry: "Industrial" },
  { clientType: "Consultant", industry: "Healthcare" },
  { clientType: "Consultant", industry: "Hospitality" },
  { clientType: "Consultant", industry: "Education" },
  { clientType: "Consultant", industry: "Data Center" },

  // Facility Management
  { clientType: "Facility Management", industry: "Commercial" },
  { clientType: "Facility Management", industry: "Residential" },
  { clientType: "Facility Management", industry: "Healthcare" },
  { clientType: "Facility Management", industry: "Hospitality" },
  { clientType: "Facility Management", industry: "Education" },
  { clientType: "Facility Management", industry: "Government" },
  { clientType: "Facility Management", industry: "Retail" },
  { clientType: "Facility Management", industry: "Data Center" },

  // Distributor / Dealer
  { clientType: "Distributor / Dealer", industry: "Residential" },
  { clientType: "Distributor / Dealer", industry: "Commercial" },
  { clientType: "Distributor / Dealer", industry: "Industrial" },
  { clientType: "Distributor / Dealer", industry: "Retail" },
  { clientType: "Distributor / Dealer", industry: "Hospitality" },

  // OEM / Manufacturer
  { clientType: "OEM / Manufacturer", industry: "Manufacturing" },
  { clientType: "OEM / Manufacturer", industry: "Commercial" },
  { clientType: "OEM / Manufacturer", industry: "Industrial" },
  { clientType: "OEM / Manufacturer", industry: "Data Center" },

  // Other
  { clientType: "Other", industry: "Other" }
];

export function getUniqueClientTypes(): string[] {
  const types = new Set<string>();
  CLIENT_INDUSTRY_MAPPING.forEach(item => types.add(item.clientType));
  return Array.from(types);
}

export function getIndustriesForType(clientType: string): string[] {
  return CLIENT_INDUSTRY_MAPPING
    .filter(item => item.clientType === clientType)
    .map(item => item.industry);
}

export const clientTypeToIndustries: Record<string, string[]> = CLIENT_INDUSTRY_MAPPING.reduce((acc, current) => {
  if (!acc[current.clientType]) {
    acc[current.clientType] = [];
  }
  acc[current.clientType].push(current.industry);
  return acc;
}, {} as Record<string, string[]>);

export function mapLegacyClientType(type: string | undefined): string {
  if (!type) return 'Business';
  const t = type.trim();
  if (['Corporate', 'SME', 'Industrial', 'Hospitality', 'Healthcare'].includes(t)) {
    return 'Business';
  }
  if (['Retail', 'Retail Client', 'Residential', 'Residential Association'].includes(t)) {
    return 'Individual';
  }
  if (['PSU', 'PSU / Government', 'Government', 'Government / Public Sector'].includes(t)) {
    return 'Government';
  }
  
  if (clientTypeToIndustries[t]) {
    return t;
  }
  return 'Other';
}
