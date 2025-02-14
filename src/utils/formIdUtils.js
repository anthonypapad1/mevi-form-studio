// State number mappings based on historical order of statehood
export const STATE_NUMBERS = {
  'DE': '0001', // Delaware
  'PA': '0002', // Pennsylvania
  'NJ': '0003', // New Jersey
  'GA': '0004', // Georgia
  'CT': '0005', // Connecticut
  'MA': '0006', // Massachusetts
  'MD': '0007', // Maryland
  'SC': '0008', // South Carolina
  'NH': '0009', // New Hampshire
  'VA': '0010', // Virginia
  'NY': '0011', // New York
  'NC': '0012', // North Carolina
  'RI': '0013', // Rhode Island
  'VT': '0014', // Vermont
  'KY': '0015', // Kentucky
  'TN': '0016', // Tennessee
  'OH': '0017', // Ohio
  'LA': '0018', // Louisiana
  'IN': '0019', // Indiana
  'MS': '0020', // Mississippi
  'IL': '0021', // Illinois
  'AL': '0022', // Alabama
  'ME': '0023', // Maine
  'MO': '0024', // Missouri
  'AR': '0025', // Arkansas
  'MI': '0026', // Michigan
  'FL': '0027', // Florida
  'TX': '0028', // Texas
  'IA': '0029', // Iowa
  'WI': '0030', // Wisconsin
  'CA': '0031', // California
  'MN': '0032', // Minnesota
  'OR': '0033', // Oregon
  'KS': '0034', // Kansas
  'WV': '0035', // West Virginia
  'NV': '0036', // Nevada
  'NE': '0037', // Nebraska
  'CO': '0000', // Colorado (kept as 0000 for backward compatibility)
  'ND': '0039', // North Dakota
  'SD': '0040', // South Dakota
  'MT': '0041', // Montana
  'WA': '0042', // Washington
  'ID': '0043', // Idaho
  'WY': '0044', // Wyoming
  'UT': '0045', // Utah
  'OK': '0046', // Oklahoma
  'NM': '0047', // New Mexico
  'AZ': '0048', // Arizona
  'AK': '0049', // Alaska
  'HI': '0050'  // Hawaii
};

// Format form ID with state number and fixed zeros
export const formatFormId = (stateNumber) => {
  return `00000000-${stateNumber}-0000-0000-000000000000`;
}; 