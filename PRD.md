# Product Requirements Document (PRD)
## Accra Rentals - Rental Price Intelligence Platform

**Version:** 1.1.0
**Last Updated:** January 27, 2026
**Status:** Active Development

---

## 1. Executive Summary

Accra Rentals is a web-based rental price intelligence platform designed for the Greater Accra rental market in Ghana. The platform provides accurate rental price estimates, market analytics, and comparison tools to help renters and landlords make informed decisions based on real market data.

---

## 2. Problem Statement

The Accra rental market lacks transparency in pricing, making it difficult for:
- **Renters** to know if they're paying fair market rates
- **Landlords** to price their properties competitively
- **Real estate agents** to provide accurate estimates to clients

Currently, price discovery relies on word-of-mouth, inconsistent listings, and negotiation, leading to:
- Overpaying for rentals
- Properties sitting vacant due to incorrect pricing
- Time wasted on unsuitable properties

---

## 3. Solution Overview

Accra Rentals aggregates rental listing data from Meqasa (a leading Ghanaian real estate platform) and provides:

1. **Price Estimation Engine** - Get accurate rent estimates based on location and bedroom count
2. **Market Analytics Dashboard** - Visualize market trends and neighborhood comparisons
3. **Location Comparison Tool** - Compare multiple neighborhoods side-by-side
4. **Saved Searches** - Track and revisit previous estimates
5. **Smart Recommendations** - AI-powered suggestions for better deals

---

## 4. Target Users

### Primary Users
| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| Renters | Individuals seeking rental properties in Accra | Fair price estimates, neighborhood comparisons |
| Landlords | Property owners setting rental prices | Market rates, competitive pricing insights |
| Real Estate Agents | Professionals advising clients | Quick estimates, shareable reports |

### Secondary Users
- Property managers
- Relocation consultants
- Urban planning researchers

---

## 5. Core Features

### 5.1 Price Estimator
**Purpose:** Provide accurate rental price estimates based on user-specified criteria.

**Functionality:**
- Select location from 75+ Greater Accra neighborhoods
- Choose bedroom count (1-5 bedrooms)
- View price range (low, average, high)
- See confidence level based on data availability
- Export results as PDF or shareable link

**Data Points:**
- Location (neighborhood)
- Number of bedrooms
- Price estimate (low/average/high)
- Confidence score (high/medium/low)
- Sample size (number of comparable listings)

### 5.2 Market Analytics Dashboard
**Purpose:** Visualize market trends and statistics across Accra neighborhoods.

**Features:**
- Average rent by location (bar chart)
- Bedroom distribution (pie chart)
- Neighborhood comparison table
- Key metrics: total listings, average rent, neighborhoods covered

### 5.3 Location Comparison Tool
**Purpose:** Compare rental prices across multiple neighborhoods.

**Features:**
- Add multiple locations for comparison
- View side-by-side price estimates
- Visual representation of price differences
- Identify best value neighborhoods

### 5.4 Saved Searches
**Purpose:** Allow users to save and track price estimates over time.

**Features:**
- Save estimates to local storage
- View history of past searches
- Delete individual or all searches
- Track market changes over time

### 5.5 Smart Recommendations
**Purpose:** Provide intelligent suggestions based on user preferences.

**Recommendation Types:**
| Type | Description |
|------|-------------|
| Cheaper Alternative | Similar properties in lower-cost neighborhoods |
| Affordable Upgrade | More bedrooms within budget |
| Best Deal | Below-average prices for the area |
| Budget Stretch | Premium areas within 15% of budget |

---

## 6. Technical Architecture

### 6.1 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14.1.0 |
| UI Library | React 18.2.0 |
| Styling | Tailwind CSS 3.4.0 |
| Charts | Recharts 2.10.3 |
| Icons | Lucide React 0.263.1 |
| Maps | Leaflet 1.9.4 / React-Leaflet 4.2.1 |
| Language | TypeScript 5.x |

### 6.2 Data Pipeline
```
Meqasa.com -> Python Scraper -> JSON Data -> Next.js App -> User Interface
```

### 6.3 Project Structure
```
accra-rentals/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── PriceEstimator.tsx    # Price estimation component
│   ├── MarketOverview.tsx    # Analytics dashboard
│   ├── ComparisonTool.tsx    # Location comparison
│   ├── SavedSearches.tsx     # Saved searches manager
│   └── Navigation.tsx        # Navigation component
├── lib/
│   ├── data.ts           # Data utilities and interfaces
│   ├── export.ts         # Export functionality
│   └── recommendations.ts # Recommendation engine
├── public/
│   └── meqasa_data.json  # Scraped rental data
└── scrapper/
    └── meqasa_scraper.py # Data scraper script
```

---

## 7. Data Model

### 7.1 Listing Interface
```typescript
interface Listing {
  title: string;
  price: number;
  price_text: string;
  price_period?: string;      // "month"
  property_type?: string;     // "apartment"
  bedrooms: number | null;
  location: string;
  area?: string;              // Search area used during scraping
  url?: string;
  source: string;
  scraped_at: string;
  page?: number;
}
```

### 7.2 Price Estimate Interface
```typescript
interface PriceEstimate {
  low: number;
  average: number;
  high: number;
  count: number;
  confidence: 'high' | 'medium' | 'low';
}
```

### 7.3 Location Statistics Interface
```typescript
interface LocationStats {
  location: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
  priceByBedroom: Record<number, number>;
}
```

---

## 8. Data Coverage

### 8.1 Current Dataset
- **Region:** Greater Accra
- **Total Areas:** 75+ neighborhoods
- **Data Source:** Meqasa.com
- **Property Type:** Apartments only (monthly rentals)
- **Update Frequency:** Daily via GitHub Actions

### 8.2 Neighborhoods Covered

**Premium/Upscale Areas:**
- East Legon, Airport Residential, Cantonments, Labone, Osu
- Ridge, Roman Ridge, Dzorwulu, Abelemkpe, Tesano

**Spintex/Tema Corridor:**
- Spintex, Tema, Community 25, Sakumono, Lashibi
- Baatsona, Kpone, Ashaiman

**North Accra:**
- Madina, Adenta, Haatso, Dome, Kwabenya
- Taifa, Achimota, Legon

**West Accra:**
- Dansoman, Kaneshie, Odorkor, Darkuman, Awoshie
- Ablekuma, Santa Maria, Kwashieman, Sowutuom

**Kasoa/Weija Corridor:**
- Kasoa, Weija, Gbawe, Mallam, McCarthy Hill

**Pokuase/Amasaman Corridor:**
- Pokuase, Amasaman, Ofankor

**Coastal Areas:**
- Teshie, Nungua, La, Labadi, Mamprobi

**Central Accra:**
- Kokomlemle, Adabraka, Asylum Down, North Ridge

**Additional Areas:**
- Prampram, Dodowa, Oyibi, East Airport, Shiashie
- American House, Trasacco, Ogbojo, West Legon, Atomic
- Tantra Hill, Lapaz, and more...

### 8.3 Price Range
- **Minimum:** GH₵500/month
- **Maximum:** GH₵100,000/month
- **Bedroom Range:** 1-5 bedrooms

---

## 9. User Interface Design

### 9.1 Design System
| Element | Specification |
|---------|---------------|
| Primary Color | Red (#ef4444) |
| Accent Color | Yellow (#eab308) |
| Font (Display) | Crimson Pro (serif) |
| Font (Body) | Work Sans (sans-serif) |
| Border Radius | 12-24px (rounded) |
| Shadows | Soft, neutral-toned |

### 9.2 Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 9.3 Key UI Components
- Gradient hero section
- Card-based content layout
- Tab-based navigation
- Interactive charts
- Confidence indicators
- Action buttons (Save, Share, Export)

---

## 10. Export Features

### 10.1 Available Export Options
| Format | Description |
|--------|-------------|
| PDF | Printable estimate report |
| Text | Copyable summary for messaging |
| Link | Shareable URL with parameters |

### 10.2 Export Content
- Property details (location, bedrooms)
- Price range (low, average, high)
- Confidence level
- Data source count
- Generation timestamp

---

## 11. Success Metrics

### 11.1 User Engagement
- Daily active users
- Estimates generated per session
- Time spent on platform
- Return visitor rate

### 11.2 Data Quality
- Price estimate accuracy
- Confidence distribution
- Data freshness

### 11.3 Feature Adoption
- Export usage rate
- Saved searches per user
- Recommendation click-through rate

---

## 12. Future Roadmap

### Phase 2 - Enhanced Features
- [ ] User authentication
- [ ] Email alerts for price changes
- [ ] Historical price trends
- [ ] Map-based property visualization
- [ ] Mobile app (React Native)

### Phase 3 - Data Expansion
- [ ] Additional data sources
- [ ] Commercial property listings
- [ ] More cities in Ghana
- [x] Automated daily scraping (GitHub Actions)
- [x] Greater Accra region coverage (75+ areas)

### Phase 4 - Advanced Analytics
- [ ] Machine learning price predictions
- [ ] Neighborhood scoring system
- [ ] Investment ROI calculator
- [ ] Property appreciation forecasts

---

## 13. Constraints & Assumptions

### 13.1 Constraints
- Data depends on Meqasa availability
- Scraping may be rate-limited
- Local storage limits saved searches
- No server-side persistence currently

### 13.2 Assumptions
- Users have modern browsers (Chrome, Firefox, Safari)
- Internet connectivity required
- Prices are in Ghanaian Cedis (GH₵)
- Monthly rental prices only

---

## 14. Glossary

| Term | Definition |
|------|------------|
| Meqasa | Leading Ghanaian real estate listing platform |
| GH₵ | Ghanaian Cedi (currency) |
| BR | Bedroom (e.g., 2 BR = 2 bedrooms) |
| Confidence Level | Reliability of estimate based on data sample size |

---

## 15. Appendix

### A. Sample API Response (Price Estimate)
```json
{
  "low": 5000,
  "average": 7500,
  "high": 10000,
  "count": 15,
  "confidence": "high"
}
```

### B. Confidence Level Thresholds
| Level | Sample Size |
|-------|-------------|
| High | 10+ listings |
| Medium | 5-9 listings |
| Low | 1-4 listings |

---

**Document Owner:** Development Team
**Approval Status:** Draft
**Next Review Date:** February 2026
