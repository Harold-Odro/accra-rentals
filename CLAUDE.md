# Accra Rentals - Claude Code Guidelines

## Project Overview

Accra Rentals is a rental price intelligence platform for the Greater Accra rental market in Ghana. Built with Next.js 14, it provides rental price estimates, market analytics, and comparison tools using data scraped from Meqasa.com.

## Tech Stack

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.0
- **Charts**: Recharts 2.10.3
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React

## Project Structure

```
accra-rentals/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── PriceEstimator.tsx # Main estimator UI
│   ├── MarketOverview.tsx # Analytics dashboard
│   └── Navigation.tsx     # Navigation component
├── lib/                   # Utilities and data logic
│   ├── data.ts           # Data utilities, interfaces, estimation logic
│   ├── export.ts         # Export functionality (PDF, text, link)
│   └── recommendations.ts # AI recommendation engine
├── public/
│   └── meqasa_data.json  # Scraped rental data (JSON)
├── scrapper/             # Python data scraper
│   └── meqasa_scraper.py # Meqasa scraping script
└── .github/workflows/    # GitHub Actions for automated scraping
```

## Key Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Code Style Guidelines

### TypeScript
- Use strict TypeScript - no `any` types
- Define interfaces in `lib/data.ts` for data structures
- Use proper type imports: `import type { ... }`

### React/Next.js
- Use functional components with hooks
- Server components by default, add `'use client'` only when needed
- Use Next.js Image component for optimized images

### Styling
- Use Tailwind CSS utility classes
- Follow design system: red (#ef4444) primary, yellow (#eab308) accent
- Fonts: Crimson Pro (display), Work Sans (body)
- Rounded corners (12-24px), soft shadows

### File Naming
- Components: PascalCase (e.g., `PriceEstimator.tsx`)
- Utilities: camelCase (e.g., `data.ts`)
- Use `.tsx` for React components, `.ts` for utilities

## Data Model

### Core Interfaces

```typescript
interface Listing {
  title: string;
  price: number;           // Monthly rent in GH₵
  price_text: string;
  price_period?: string;   // "month"
  property_type?: string;  // "apartment"
  bedrooms: number | null;
  location: string;        // Neighborhood name
  url?: string;
  source: string;
  scraped_at: string;
}

interface PriceEstimate {
  low: number;
  average: number;
  high: number;
  count: number;           // Sample size
  confidence: 'high' | 'medium' | 'low';
}
```

### Confidence Levels
- **High**: 10+ listings
- **Medium**: 5-9 listings
- **Low**: 1-4 listings

## Important Notes

### Data Pipeline
- Data is scraped from Meqasa.com via Python script in `scrapper/`
- Automated daily via GitHub Actions
- Only apartments with monthly rent are included
- 75+ Greater Accra neighborhoods covered

### Price Range
- Minimum: GH₵500/month
- Maximum: GH₵100,000/month
- Bedroom range: 1-5 bedrooms

### Local Storage
- Saved searches stored in browser localStorage
- No server-side persistence currently

## Common Patterns

### Adding a New Component
1. Create in `components/` with PascalCase name
2. Use TypeScript interfaces for props
3. Import in `app/page.tsx` and add to tab system

### Updating Price Estimation
- Logic lives in `lib/data.ts` → `estimatePrice()`
- Filters by location (fuzzy match) and bedroom count
- Calculates percentiles for low/avg/high

### Adding New Locations
- Update `LOCATIONS` array in `components/PriceEstimator.tsx`
- Ensure scraper covers the area in `scrapper/meqasa_scraper.py`

## Testing

Currently no test suite. When adding tests:
- Use Jest + React Testing Library
- Place tests in `__tests__/` directories
- Focus on price estimation logic first

## Data Scraping

### Parallel Scraper (Recommended)
```bash
cd scrapper
python meqasa_parallel_scraper.py --workers 4 --pages 10
```

- Uses 4 parallel browser instances
- 5-10x faster than sequential scraper
- Outputs to `public/meqasa_data.json`

### Options
- `--workers N` - Number of parallel workers (default: 4)
- `--pages N` - Max pages per area (default: 10)
- `--output PATH` - Custom output path

## Debugging Tips

- Check browser console for React errors
- Use `console.log` in `lib/data.ts` to debug price calculations
- Verify `public/meqasa_data.json` has fresh data
- Check GitHub Actions for scraper errors

## Don't Do

- Don't use inline styles - use Tailwind classes
- Don't hardcode prices - always calculate from data
- Don't commit `.env.local` or API keys
- Don't modify `meqasa_data.json` manually - run scraper instead
- Don't use `any` type - define proper interfaces

## Previous Corrections

<!-- Claude: Add learnings here when user corrects mistakes -->

## Project-Specific Knowledge

### Neighborhoods
Premium areas: East Legon, Airport Residential, Cantonments, Labone, Osu
Budget areas: Kasoa, Madina, Tema, Dansoman, Adenta

### Currency
All prices in Ghanaian Cedis (GH₵). Format with `Intl.NumberFormat('en-GH')`.

### Design Philosophy
- Bold, distinctive aesthetic (not generic AI look)
- Ghana-inspired colors (red, yellow, green accents)
- Mobile-first responsive design
