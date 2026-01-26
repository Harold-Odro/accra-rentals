# Accra Rentals - Property Price Intelligence Platform

A modern Next.js application for rental price estimation and market analytics in Greater Accra, Ghana.

## Features

✨ **Price Estimator** - Get accurate rental price estimates based on location and property size
📊 **Market Analytics** - View trends, charts, and neighborhood comparisons
🗺️ **Map View** - Visual property distribution (coming soon)
💾 **Saved Searches** - Save and revisit your searches
📱 **Mobile-First** - Optimized for all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Crimson Pro (display) + Work Sans (body)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Scraped Data

Replace the sample data with your actual Meqasa data:

1. Copy your `meqasa_data.json` to the `public` folder
2. Update `lib/data.ts` to load your data:

```typescript
// lib/data.ts
import rentalData from '@/public/meqasa_data.json'

export function getListings(): Listing[] {
  return rentalData.listings
}
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
accra-rentals/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Homepage with tabs
│   └── globals.css         # Global styles
├── components/
│   ├── Navigation.tsx      # Top navigation
│   ├── PriceEstimator.tsx  # Main estimator UI
│   └── MarketOverview.tsx  # Analytics dashboard
├── lib/
│   └── data.ts             # Data utilities & estimation logic
└── public/
    └── meqasa_data.json    # Your scraped data (add this!)
```

## Customization

### Update Neighborhoods

Edit the locations list in `components/PriceEstimator.tsx`:

```typescript
const LOCATIONS = [
  'East Legon',
  'Cantonments',
  // Add your locations...
]
```

### Adjust Price Estimation Logic

The estimation algorithm is in `lib/data.ts`:

```typescript
export function estimatePrice(
  location: string,
  bedrooms: number,
  listings: Listing[]
): PriceEstimate | null {
  // Your custom logic here
}
```

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Your brand colors
  },
}
```

## Features to Add

### Map View

Install map library:
```bash
npm install react-leaflet leaflet
```

Add to a new component:
```typescript
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
```

### Comparison Tool

Create `components/ComparisonTool.tsx`:
- Compare multiple neighborhoods side-by-side
- Show price differences
- Highlight best value

### Saved Searches

Already implemented with localStorage. To add sync:
- Use a backend API
- Or use Supabase for easy database

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Push to GitHub
# Connect to Vercel
```

### Other Platforms

```bash
npm run build
npm start
```

## Data Updates

To update with fresh data:

1. Run your scraper:
```bash
python meqasa_working_scraper.py
```

2. Copy new `meqasa_data.json` to `public/`

3. Rebuild:
```bash
npm run build
```

## Design Philosophy

This app uses a distinctive aesthetic:
- **Typography**: Crimson Pro (elegant serif) + Work Sans (clean sans)
- **Colors**: Bold red/yellow accents on neutral base
- **Layout**: Generous spacing, rounded corners, subtle shadows
- **Motion**: Smooth transitions and animations

Avoid generic AI aesthetics - every detail is intentional.

## Next Steps

1. **Add Real Data**: Replace sample data with your scraper output
2. **Test Estimation**: Verify price calculations are accurate
3. **Add More Features**: Map view, comparison tool, user accounts
4. **Deploy**: Ship to production!

## License

Private project

## Support

For questions or issues, refer to the codebase or Next.js documentation.
