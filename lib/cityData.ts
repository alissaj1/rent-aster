export type Neighborhood = {
  name: string;
  vibe: string;
  avgRent1BR: number;
  tags: string[];
  lat: number;
  lng: number;
};

export type Tip = {
  text: string;
  quote: string;
  author: string;
  context: string;
};

export type CityData = {
  name: string;
  state: string;
  tagline: string;
  center: { lat: number; lng: number };
  avgRents: { studio: number; oneBR: number; twoBR: number; threeBR: number };
  marketNorms: {
    deposit: string; leaseTerms: string[]; petPolicy: string;
    applicationFee: string; creditScore: string; incomeRequirement: string;
  };
  searchPlatforms: { name: string; url: string; bestFor: string }[];
  neighborhoods: Neighborhood[];
  proTips: Tip[];
  redFlags: { title: string; detail: string; severity: "high" | "medium" }[];
};

export const CITIES: Record<string, CityData> = {
  "new york": {
    name: "New York", state: "NY",
    tagline: "If you can make rent here, you can make rent anywhere",
    center: { lat: 40.73, lng: -73.93 },
    avgRents: { studio: 2800, oneBR: 3500, twoBR: 4800, threeBR: 6500 },
    marketNorms: {
      deposit: "1 month's rent (by law)",
      leaseTerms: ["12 months", "24 months"],
      petPolicy: "Often no pets or heavy fees ($50–$100/mo)",
      applicationFee: "$20 (capped by law)",
      creditScore: "700+ preferred",
      incomeRequirement: "40× monthly rent annually",
    },
    searchPlatforms: [
      { name: "StreetEasy", url: "https://streeteasy.com", bestFor: "NYC-specific, most complete inventory" },
      { name: "Zillow", url: "https://zillow.com", bestFor: "Broad search with strong filters" },
      { name: "Naked Apartments", url: "https://nakedapartments.com", bestFor: "No-fee apartments only" },
      { name: "Facebook Marketplace", url: "https://facebook.com/marketplace", bestFor: "Direct landlord deals, lower fees" },
    ],
    neighborhoods: [
      { name: "Washington Heights", vibe: "Latinx culture, family-friendly, underrated", avgRent1BR: 2000, tags: ["Manhattan", "Culture", "Budget-Friendly"], lat: 40.8448, lng: -73.9397 },
      { name: "Harlem", vibe: "Historic, community-driven, gentrifying", avgRent1BR: 2300, tags: ["Manhattan", "Culture", "Affordable"], lat: 40.8116, lng: -73.9465 },
      { name: "Astoria", vibe: "Chill, multicultural, great food", avgRent1BR: 2400, tags: ["Queens", "Transit Access", "Foodie"], lat: 40.7721, lng: -73.9301 },
      { name: "Crown Heights", vibe: "Diverse, parks, strong community", avgRent1BR: 2500, tags: ["Brooklyn", "Parks", "Community"], lat: 40.6681, lng: -73.9442 },
      { name: "Bushwick", vibe: "Artsy, nightlife, up-and-coming", avgRent1BR: 2600, tags: ["Brooklyn", "Nightlife", "Art Scene"], lat: 40.6944, lng: -73.9212 },
    ],
    proTips: [
      { text: "Brokers charge 1 month's fee — search 'no fee' to avoid this", quote: "I almost paid $3,500 in broker fees before a friend told me about no-fee listings on StreetEasy. Always filter for no-fee first.", author: "Tanya R.", context: "Moved to Brooklyn" },
      { text: "Apply to multiple places same day — good apartments go in hours", quote: "I lost three apartments in one week by waiting 24 hours to apply. Same day is the only way.", author: "DeShawn M.", context: "First-time NYC renter" },
      { text: "Guarantors must earn 80× rent — look into guarantor services like Insurent or TheGuarantor if you don't qualify", quote: "I used Insurent and it cost me one month's rent, but it got me an apartment I'd never have qualified for alone.", author: "Priya S.", context: "Recent grad, moved to Manhattan" },
    ],
    redFlags: [
      { title: "Rent below market", detail: "If the price looks too good for the neighborhood, it almost certainly is. NYC has a deep scam ecosystem.", severity: "high" },
      { title: "'Wire us a deposit'", detail: "Legitimate landlords do not ask for wires before you've signed a lease and toured in person.", severity: "high" },
      { title: "No lease offered", detail: "Month-to-month is common but you should always have a written agreement — verbal deals leave you unprotected.", severity: "medium" },
    ],
  },

  "los angeles": {
    name: "Los Angeles", state: "CA",
    tagline: "Sun, traffic, and a surprisingly huge rental market",
    center: { lat: 34.052, lng: -118.243 },
    avgRents: { studio: 1900, oneBR: 2400, twoBR: 3200, threeBR: 4200 },
    marketNorms: {
      deposit: "2× monthly rent (unfurnished)",
      leaseTerms: ["6 months", "12 months", "Month-to-month"],
      petPolicy: "Pet-friendly common; expect $50–$100/mo pet rent",
      applicationFee: "Max $30 (by law)",
      creditScore: "650+ preferred",
      incomeRequirement: "3× monthly rent",
    },
    searchPlatforms: [
      { name: "Zillow", url: "https://zillow.com", bestFor: "Largest inventory, best filters" },
      { name: "Apartments.com", url: "https://apartments.com", bestFor: "Strong for large complexes" },
      { name: "Craigslist", url: "https://losangeles.craigslist.org", bestFor: "Direct landlord listings, lower cost" },
      { name: "HotPads", url: "https://hotpads.com", bestFor: "Map-based search" },
      { name: "Facebook Marketplace", url: "https://facebook.com/marketplace", bestFor: "Local deals, private landlords" },
    ],
    neighborhoods: [
      { name: "Koreatown", vibe: "Dense, affordable, 24hr energy", avgRent1BR: 1800, tags: ["Dense", "Affordable", "Nightlife"], lat: 34.0559, lng: -118.3006 },
      { name: "Long Beach", vibe: "Beach city vibes, more affordable than LA proper", avgRent1BR: 1700, tags: ["Beach", "Affordable", "Chill"], lat: 33.7701, lng: -118.1937 },
      { name: "Echo Park", vibe: "Artsy, lake views, gentrifying fast", avgRent1BR: 2200, tags: ["Parks", "Art", "Changing Fast"], lat: 34.0783, lng: -118.2601 },
      { name: "Silver Lake", vibe: "Walkable (for LA), indie scene, strong community", avgRent1BR: 2300, tags: ["Walkable", "Arts", "Trendy"], lat: 34.0871, lng: -118.2720 },
      { name: "Culver City", vibe: "Tech hub, metro access, family-friendly", avgRent1BR: 2600, tags: ["Tech", "Metro Access", "Upscale"], lat: 34.0211, lng: -118.3964 },
    ],
    proTips: [
      { text: "Ask about rent control — buildings built before 1978 often have tenant protections", quote: "My landlord tried to raise my rent 40% at renewal. Turns out my building had RSO protections and the max increase was 3%. Know your rights.", author: "Marcus W.", context: "Long-term Silver Lake renter" },
      { text: "Many landlords post on Craigslist directly — cheaper than broker platforms", quote: "Found my apartment on Craigslist for $300 less than the same unit listed on Zillow. The landlord just preferred direct contact.", author: "Sasha T.", context: "Koreatown resident" },
      { text: "Traffic is real — live near your job or a Metro line", quote: "I took a 'cheaper' apartment 6 miles from work. Add two hours a day in traffic and it cost me more in time and gas than a closer place would have.", author: "Jordan L.", context: "Moved from the Midwest" },
    ],
    redFlags: [
      { title: "No rent control disclosure", detail: "Pre-1978 buildings have RSO protections. If a landlord won't discuss rent history or control status, investigate before signing.", severity: "high" },
      { title: "Visible mold, pests, or deferred repairs", detail: "In CA, landlords must disclose known habitability issues. 'As-is' offers are a red flag.", severity: "high" },
      { title: "No on-site management in large buildings", detail: "In a building with 10+ units, lack of on-site management means maintenance issues go unresolved for weeks.", severity: "medium" },
    ],
  },

  "chicago": {
    name: "Chicago", state: "IL",
    tagline: "Big city amenities, actually reasonable prices",
    center: { lat: 41.878, lng: -87.63 },
    avgRents: { studio: 1200, oneBR: 1600, twoBR: 2100, threeBR: 2700 },
    marketNorms: {
      deposit: "1–2 months rent",
      leaseTerms: ["12 months preferred", "Month-to-month with premium"],
      petPolicy: "Many allow pets; $200–$500 deposit typical",
      applicationFee: "$25–$75",
      creditScore: "620+ for most",
      incomeRequirement: "3× monthly rent",
    },
    searchPlatforms: [
      { name: "Apartments.com", url: "https://apartments.com", bestFor: "Largest Chicago inventory" },
      { name: "Domu", url: "https://domu.com", bestFor: "Chicago-specific, local landlords" },
      { name: "Zillow", url: "https://zillow.com", bestFor: "Market overview, all listing types" },
      { name: "Craigslist", url: "https://chicago.craigslist.org", bestFor: "Local deals, private landlords" },
    ],
    neighborhoods: [
      { name: "Rogers Park", vibe: "Affordable, diverse, lakefront access", avgRent1BR: 1100, tags: ["Affordable", "Diverse", "Lake Views"], lat: 42.0085, lng: -87.6673 },
      { name: "Pilsen", vibe: "Latinx culture, art, rapidly changing", avgRent1BR: 1400, tags: ["Art", "Culture", "Affordable"], lat: 41.8558, lng: -87.6573 },
      { name: "Logan Square", vibe: "Trendy, diverse, great restaurants", avgRent1BR: 1500, tags: ["Trendy", "Transit", "Foodie"], lat: 41.9217, lng: -87.7012 },
      { name: "Andersonville", vibe: "Queer-friendly, tight-knit, charming", avgRent1BR: 1600, tags: ["Community", "Safe", "Charming"], lat: 41.9789, lng: -87.6672 },
      { name: "Wicker Park", vibe: "Hip, nightlife, young professional", avgRent1BR: 1700, tags: ["Nightlife", "Shopping", "Vibrant"], lat: 41.9083, lng: -87.6793 },
    ],
    proTips: [
      { text: "Heat is often included in older 2-flat buildings — big winter savings", quote: "My heat-included unit saved me $280/mo in January. Always ask what utilities are included — in Chicago it actually matters.", author: "Aaliyah K.", context: "Rogers Park renter" },
      { text: "Street parking is zone-based — get a city sticker if you drive", quote: "Got a $200 ticket my first week because I didn't know about city stickers. Ask your landlord about the parking zone before move-in.", author: "Dominic T.", context: "Moved from Ohio" },
      { text: "Ask about boiler age before signing — old ones fail in winter", quote: "The boiler died February 1st. It took 11 days to fix. Always ask when major systems were last serviced.", author: "Nia F.", context: "First-time Chicago renter" },
    ],
    redFlags: [
      { title: "Heat not included in older buildings", detail: "Gas heat in Chicago can run $300+ in January. If heat isn't included, get utility cost history from the landlord.", severity: "high" },
      { title: "Basement units in flood-prone areas", detail: "Chicago has combined sewer overflows. Ask about flood history, especially for below-grade units near the river.", severity: "high" },
      { title: "Landlord refuses pre-move-in inspection", detail: "Without a documented walkthrough, you're liable for pre-existing damage. Never skip the inspection checklist.", severity: "medium" },
    ],
  },

  "austin": {
    name: "Austin", state: "TX",
    tagline: "Keep Austin Weird — and hope your rent stays stable",
    center: { lat: 30.267, lng: -97.743 },
    avgRents: { studio: 1400, oneBR: 1700, twoBR: 2200, threeBR: 2800 },
    marketNorms: {
      deposit: "1 month's rent typical",
      leaseTerms: ["12 months standard"],
      petPolicy: "Pet-friendly is common; $200–$400 deposit + $25–$50/mo",
      applicationFee: "$50–$100",
      creditScore: "620+ preferred",
      incomeRequirement: "3× monthly rent",
    },
    searchPlatforms: [
      { name: "Apartments.com", url: "https://apartments.com", bestFor: "Large complexes, best filters" },
      { name: "Zillow", url: "https://zillow.com", bestFor: "All listing types, good overview" },
      { name: "Facebook Marketplace", url: "https://facebook.com/marketplace", bestFor: "Local landlord deals" },
      { name: "Austin Board of Realtors", url: "https://abor.com", bestFor: "MLS listings, houses for rent" },
    ],
    neighborhoods: [
      { name: "Round Rock", vibe: "Suburban, affordable, good schools", avgRent1BR: 1400, tags: ["Suburban", "Affordable", "Families"], lat: 30.5083, lng: -97.6789 },
      { name: "St. Elmo", vibe: "Up-and-coming, industrial-cool", avgRent1BR: 1700, tags: ["Emerging", "Hip", "Affordable-ish"], lat: 30.2174, lng: -97.7610 },
      { name: "Mueller", vibe: "Planned community, walkable, family-friendly", avgRent1BR: 1800, tags: ["Walkable", "Family", "New Construction"], lat: 30.2984, lng: -97.7041 },
      { name: "East Austin", vibe: "Trendy, great food, gentrifying hard", avgRent1BR: 1900, tags: ["Trendy", "Foodie", "Walkable"], lat: 30.2568, lng: -97.7218 },
      { name: "South Congress", vibe: "Quirky, boutique-y, very Austin", avgRent1BR: 2100, tags: ["Iconic", "Walkable", "Expensive"], lat: 30.2374, lng: -97.7524 },
    ],
    proTips: [
      { text: "Texas has no rent control — prices can spike significantly at renewal", quote: "My rent went up $400 at renewal with 60 days notice. Legal in Texas. Always negotiate before your lease ends and have a backup plan.", author: "Carmen V.", context: "East Austin renter" },
      { text: "Check proximity to I-35; traffic is notoriously bad", quote: "I lived 4 miles from work and my commute was 45 minutes. The apartment off the highway was louder, too. Pay for proximity in Austin.", author: "Tyler B.", context: "Tech worker, moved from SF" },
      { text: "Many units don't include W/D hookups or machines — always ask", quote: "I assumed 'laundry in unit' meant a machine. It meant hookups only. Rented a washer for $60/mo my entire lease.", author: "Fatima N.", context: "Mueller neighborhood" },
    ],
    redFlags: [
      { title: "No renewal cap protections", detail: "Texas has zero rent control. If you can't afford a 20–30% increase, don't sign in a building where the landlord has a track record of large hikes.", severity: "high" },
      { title: "Flooding near Waller Creek and waterways", detail: "Austin has significant flash flood risk. Check FEMA flood maps and ask about historical flooding before signing.", severity: "high" },
      { title: "Hidden fees in 'luxury' complexes", detail: "Valet trash ($30), amenity fees ($50–$100), reserved parking ($75+) — the advertised rent can be $200/mo more in reality.", severity: "medium" },
    ],
  },

  "seattle": {
    name: "Seattle", state: "WA",
    tagline: "Tech salaries meet Pacific Northwest soul",
    center: { lat: 47.606, lng: -122.332 },
    avgRents: { studio: 1600, oneBR: 2000, twoBR: 2800, threeBR: 3800 },
    marketNorms: {
      deposit: "Max 1 month's rent (by law)",
      leaseTerms: ["12 months standard", "Month-to-month available"],
      petPolicy: "Pet-friendly common; $250–$500 deposit",
      applicationFee: "Max $75 (by law)",
      creditScore: "650+ preferred",
      incomeRequirement: "3× monthly rent",
    },
    searchPlatforms: [
      { name: "Zillow", url: "https://zillow.com", bestFor: "Best Seattle coverage, strong filters" },
      { name: "Apartments.com", url: "https://apartments.com", bestFor: "Large complexes and new builds" },
      { name: "Craigslist", url: "https://seattle.craigslist.org", bestFor: "Private landlords, older buildings" },
      { name: "PadMapper", url: "https://padmapper.com", bestFor: "Map-based search with price overlay" },
    ],
    neighborhoods: [
      { name: "Rainier Valley", vibe: "Diverse, affordable, light rail access", avgRent1BR: 1500, tags: ["Affordable", "Diverse", "Transit"], lat: 47.5532, lng: -122.2870 },
      { name: "Beacon Hill", vibe: "Diverse, community-oriented, light rail", avgRent1BR: 1700, tags: ["Diverse", "Transit", "Affordable-ish"], lat: 47.5706, lng: -122.3120 },
      { name: "Fremont", vibe: "Quirky, artsy, 'Center of the Universe'", avgRent1BR: 1900, tags: ["Quirky", "Art", "Walkable"], lat: 47.6520, lng: -122.3500 },
      { name: "Capitol Hill", vibe: "Queer-friendly, nightlife, walkable", avgRent1BR: 2100, tags: ["Walkable", "Nightlife", "LGBTQ+"], lat: 47.6253, lng: -122.3222 },
      { name: "Ballard", vibe: "Hip, brewery scene, waterfront", avgRent1BR: 2000, tags: ["Trendy", "Breweries", "Waterfront"], lat: 47.6677, lng: -122.3833 },
    ],
    proTips: [
      { text: "Renters have strong protections — 180 days notice required for rent increases over 10%", quote: "My landlord tried to raise my rent 15% with 60 days notice. That's illegal here. I filed a complaint and the increase was postponed. Know your rights.", author: "Kelsey M.", context: "Capitol Hill renter" },
      { text: "Light rail is expanding — proximity adds real commute value", quote: "I specifically moved near a Link station. My commute went from 45 minutes to 12. Worth every dollar of the location premium.", author: "Ravi P.", context: "Software engineer, Beacon Hill" },
      { text: "Parking is brutal downtown — check transit score before signing", quote: "The apartment was perfect. Gave up my car, saved $400/mo. Just make sure you're truly walkable to grocery and transit first.", author: "Mei L.", context: "Fremont resident" },
    ],
    redFlags: [
      { title: "No seismic retrofitting in older buildings", detail: "Seattle sits on a seismic zone. The city has a database of unreinforced masonry buildings — check it before signing a lease in older construction.", severity: "high" },
      { title: "Below-grade units with drainage issues", detail: "Seattle's rain is real. Basement apartments without proper drainage and dehumidification grow mold within a season.", severity: "high" },
      { title: "Landlords not following 180-day notice rule", detail: "Increases over 10% require 180 days notice. If a landlord cites a different timeline, they may not know — or follow — the law.", severity: "medium" },
    ],
  },

  "miami": {
    name: "Miami", state: "FL",
    tagline: "Sunshine, salsa, and skyrocketing rents",
    center: { lat: 25.77, lng: -80.20 },
    avgRents: { studio: 1800, oneBR: 2300, twoBR: 3200, threeBR: 4500 },
    marketNorms: {
      deposit: "1–2 months rent",
      leaseTerms: ["12 months standard", "Short-term at a premium"],
      petPolicy: "Variable; many condos ban pets entirely",
      applicationFee: "$50–$100",
      creditScore: "650+ preferred",
      incomeRequirement: "3× monthly rent",
    },
    searchPlatforms: [
      { name: "Zillow", url: "https://zillow.com", bestFor: "Full market view, strongest filters" },
      { name: "Apartments.com", url: "https://apartments.com", bestFor: "Large complexes, new builds" },
      { name: "Zumper", url: "https://zumper.com", bestFor: "Good Miami coverage, fast listings" },
      { name: "Facebook Marketplace", url: "https://facebook.com/marketplace", bestFor: "Local deals, Spanish-language listings" },
    ],
    neighborhoods: [
      { name: "Hialeah", vibe: "Suburban, very affordable, Cuban-American hub", avgRent1BR: 1600, tags: ["Affordable", "Suburban", "Cultural"], lat: 25.8576, lng: -80.2781 },
      { name: "Little Havana", vibe: "Rich culture, authentic, more affordable", avgRent1BR: 1800, tags: ["Culture", "Affordable", "Community"], lat: 25.7682, lng: -80.2268 },
      { name: "Little Haiti", vibe: "Culturally rich, rapidly gentrifying", avgRent1BR: 1900, tags: ["Culture", "Changing Fast", "Community"], lat: 25.8201, lng: -80.1943 },
      { name: "Wynwood", vibe: "Art district, murals everywhere, trendy", avgRent1BR: 2500, tags: ["Art", "Trendy", "Nightlife"], lat: 25.8008, lng: -80.1993 },
      { name: "Brickell", vibe: "Finance district, sleek, walkable", avgRent1BR: 3000, tags: ["Luxury", "Walkable", "Expensive"], lat: 25.7617, lng: -80.1918 },
    ],
    proTips: [
      { text: "Hurricane insurance and flood zone checks are essential before signing", quote: "I signed without checking the flood zone. Category 1 put a foot of water in my unit. Always, always check the FEMA map first.", author: "Roberto S.", context: "First-year Miami renter" },
      { text: "AC is a utility, not a luxury — budget $150–$250/mo in summer", quote: "My 'affordable' apartment became $300/mo more expensive June–September because of AC bills. Always ask for utility averages.", author: "Jasmine C.", context: "Moved from Chicago" },
      { text: "The free Brickell Metromover can replace a car for certain routes", quote: "I gave up my car, take the Metromover and Metrorail everywhere, and save $500/mo. It takes planning but it works.", author: "Paulo M.", context: "Brickell resident" },
    ],
    redFlags: [
      { title: "FEMA flood zone not checked", detail: "Miami is one of the most flood-vulnerable cities in the US. Units in Zone AE or VE face regular flood risk — and require expensive flood insurance.", severity: "high" },
      { title: "Short-term rental buildings", detail: "Buildings with Airbnb-heavy units have rotating strangers, noise issues, and unstable neighbors. Ask about short-term rental policies.", severity: "medium" },
      { title: "Old building with no seawall", detail: "Proximity to water without proper seawall infrastructure means flooding risk even without a hurricane. Check the building's elevation certificate.", severity: "high" },
    ],
  },
};

export function findCity(query: string): CityData | null {
  const q = query.toLowerCase().trim();
  for (const [key, data] of Object.entries(CITIES)) {
    if (q.includes(key) || key.includes(q) || data.name.toLowerCase().includes(q)) return data;
  }
  return null;
}

export function filterNeighborhoodsByBudget(city: CityData, maxBudget: number): Neighborhood[] {
  return city.neighborhoods.filter((n) => n.avgRent1BR <= maxBudget);
}

export const CITY_LIST = Object.values(CITIES).map((c) => c.name);
