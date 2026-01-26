# Calculations Guide

This document explains how Accra Rentals calculates price estimates, confidence scores, and recommendations.

---

## Table of Contents

1. [Price Estimation](#1-price-estimation)
2. [Confidence Score](#2-confidence-score)
3. [Location Statistics](#3-location-statistics)
4. [Recommendations](#4-recommendations)
5. [Visual Summary](#5-visual-summary)

---

## 1. Price Estimation

The price estimation algorithm in `lib/data.ts` uses a two-tier approach depending on data availability.

### Scenario A: Exact Match Found

When we have listings matching both **location AND bedroom count**:

```
User searches: 2 bedrooms in Osu
Found: 8 listings matching exactly

Prices: [5000, 5500, 6000, 6500, 7000, 7500, 8000, 9000]
         ↑                                            ↑
        Low                                         High

Average = (5000+5500+6000+6500+7000+7500+8000+9000) / 8
        = 54,500 / 8
        = GH₵6,812
```

**Result:**
| Metric | Value | Calculation |
|--------|-------|-------------|
| Low | GH₵5,000 | Actual minimum from data |
| Average | GH₵6,812 | Arithmetic mean |
| High | GH₵9,000 | Actual maximum from data |
| Confidence | Medium | 5-9 listings found |

### Scenario B: No Exact Match (Fallback Estimation)

When the location exists but no listings match the requested bedroom count:

```
User searches: 4 bedrooms in Osu
Found: 0 exact matches, but Osu has other listings
```

**Step 1: Get market-wide average for requested bedrooms**
```
All 4BR listings across Accra: [12000, 15000, 18000, 20000...]
Market average for 4BR = GH₵16,000
```

**Step 2: Calculate location's price premium/discount**
```
Osu average (all bedrooms): GH₵8,000
Market average (all bedrooms): GH₵10,000

Location premium = 8000 / 10000 = 0.8
(Osu is 20% cheaper than market average)
```

**Step 3: Apply premium to market average**
```
Estimated price = Market avg × Location premium
                = 16,000 × 0.8
                = GH₵12,800
```

**Step 4: Calculate range using percentiles**
```
Low  = 10th percentile of 4BR prices × location premium
High = 90th percentile of 4BR prices × location premium
```

**Result:**
| Metric | Value | Calculation |
|--------|-------|-------------|
| Low | GH₵10,240 | 10th percentile × 0.8 |
| Average | GH₵12,800 | Market avg × premium |
| High | GH₵15,360 | 90th percentile × 0.8 |
| Confidence | Low | Estimated (not from exact matches) |

### Last Resort: Price-per-Bedroom

If no market-wide data exists for the bedroom count:

```
Total price of all listings with bedrooms: GH₵150,000
Total bedrooms across those listings: 25

Price per bedroom = 150,000 / 25 = GH₵6,000

For 3 bedrooms: 6,000 × 3 = GH₵18,000
```

---

## 2. Confidence Score

The confidence score indicates how reliable the estimate is based on sample size.

| Listings Found | Confidence | Description |
|----------------|------------|-------------|
| 10+ | **High** | Very reliable - large sample size |
| 5-9 | **Medium** | Reasonably reliable |
| 1-4 | **Low** | Limited data - use with caution |
| 0 (estimated) | **Low** | No exact match - calculated from market data |

### Code Implementation

```typescript
confidence: filtered.length >= 10 ? 'high'
          : filtered.length >= 5 ? 'medium'
          : 'low'
```

---

## 3. Location Statistics

The `getLocationStats` function calculates comprehensive statistics for each neighborhood.

### For Each Location

```
East Legon (25 listings):
│
├── averagePrice: sum(all prices) / count
│   = (5000 + 7000 + 8000 + ...) / 25
│   = GH₵12,500
│
├── minPrice: Math.min(...prices)
│   = GH₵5,000
│
├── maxPrice: Math.max(...prices)
│   = GH₵35,000
│
├── count: 25
│
└── priceByBedroom:
    ├── 1BR: avg(1BR prices) = GH₵6,000
    ├── 2BR: avg(2BR prices) = GH₵9,500
    ├── 3BR: avg(3BR prices) = GH₵15,000
    ├── 4BR: avg(4BR prices) = GH₵22,000
    └── 5BR: avg(5BR prices) = GH₵30,000
```

### Bedroom Distribution

```typescript
// Count listings per bedroom type
{
  1: 15,  // 15 one-bedroom listings
  2: 45,  // 45 two-bedroom listings
  3: 30,  // 30 three-bedroom listings
  4: 8,   // 8 four-bedroom listings
  5: 2    // 2 five-bedroom listings
}
```

### Price Ranges

| Range | Filter Condition |
|-------|------------------|
| Under GH₵5,000 | `price >= 0 && price < 5000` |
| GH₵5,000 - GH₵10,000 | `price >= 5000 && price < 10000` |
| GH₵10,000 - GH₵20,000 | `price >= 10000 && price < 20000` |
| GH₵20,000 - GH₵30,000 | `price >= 20000 && price < 30000` |
| Over GH₵30,000 | `price >= 30000` |

---

## 4. Recommendations

The recommendation engine in `lib/recommendations.ts` provides four types of suggestions.

### 4.1 Cheaper Alternatives

Finds locations with same bedroom count at lower prices.

**Logic:**
```
Current: 2BR in East Legon = GH₵10,000
Threshold: 15% cheaper (price < current × 0.85)

Filter: Find 2BR < GH₵8,500 in other locations

Results:
┌──────────┬─────────┬─────────┬──────────────┐
│ Location │ 2BR     │ Savings │ % Savings    │
├──────────┼─────────┼─────────┼──────────────┤
│ Osu      │ GH₵7,500│ GH₵2,500│ 25%          │
│ Achimota │ GH₵6,000│ GH₵4,000│ 40%          │
│ Tema     │ GH₵5,500│ GH₵4,500│ 45%          │
└──────────┴─────────┴─────────┴──────────────┘
```

### 4.2 Best Deals

Finds listings significantly below **market average** for the same bedroom count.

**Logic:**
```
Step 1: Calculate market average for 2BR
        All 2BR prices: [6000, 7000, 8000, 9000, 10000, 12000...]
        Market avg = GH₵9,000

Step 2: Find locations where 2BR < market avg × 0.85
        Threshold: GH₵7,650

Results:
┌──────────┬─────────┬──────────────────────┐
│ Location │ 2BR     │ Below Market         │
├──────────┼─────────┼──────────────────────┤
│ Tema     │ GH₵7,000│ 22% below market avg │
│ Dansoman │ GH₵6,500│ 28% below market avg │
└──────────┴─────────┴──────────────────────┘
```

**Important:** We compare to market average for the **same bedroom count**, not the location's overall average. This prevents false positives where 1BR is flagged as a "deal" just because it's cheaper than 3BR.

### 4.3 Affordable Upgrades

Finds more bedrooms within budget (+10%).

**Logic:**
```
User budget (from search): GH₵8,000 for 2BR
Threshold: budget × 1.10 = GH₵8,800

Find: 3BR options ≤ GH₵8,800

Results:
┌──────────┬─────────┬─────────────────────────┐
│ Location │ 3BR     │ Upgrade Cost            │
├──────────┼─────────┼─────────────────────────┤
│ Achimota │ GH₵8,500│ +GH₵500 for extra room  │
│ Tema     │ GH₵8,200│ +GH₵200 for extra room  │
└──────────┴─────────┴─────────────────────────┘
```

### 4.4 Budget Stretch

Premium areas slightly above budget (+15% max).

**Logic:**
```
User budget: GH₵8,000
Range: GH₵8,000 < price ≤ GH₵9,200

Find: Premium locations in this range

Results:
┌────────────┬─────────┬─────────────────────────┐
│ Location   │ 2BR     │ Extra Cost              │
├────────────┼─────────┼─────────────────────────┤
│ Cantonments│ GH₵9,000│ +GH₵1,000 for premium   │
│ Airport    │ GH₵8,800│ +GH₵800 for premium     │
└────────────┴─────────┴─────────────────────────┘
```

### Recommendation Summary Table

| Type | Icon | Criteria | Max Results |
|------|------|----------|-------------|
| Cheaper Alternative | 💰 | Same BR, 15%+ cheaper | 3 |
| Best Deal | 🎯 | 15%+ below market avg for BR | 2 |
| Affordable Upgrade | ⬆️ | +1 BR within 10% of budget | 2 |
| Budget Stretch | ✨ | Premium area, max 15% over | 2 |

---

## 5. Visual Summary

### Price Estimation Flow

```
┌─────────────────────────────────────────────────────────┐
│                    PRICE ESTIMATION                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   User Input: Location + Bedrooms                        │
│        │                                                 │
│        ▼                                                 │
│   ┌─────────────────┐                                   │
│   │ Exact matches?  │                                   │
│   └────────┬────────┘                                   │
│            │                                             │
│      ┌─────┴─────┐                                      │
│      │           │                                      │
│     Yes          No                                     │
│      │           │                                      │
│      ▼           ▼                                      │
│   ┌──────────┐  ┌──────────────────┐                   │
│   │Use actual│  │ Calculate from:  │                   │
│   │min/avg/  │  │ • Market avg     │                   │
│   │max       │  │ • Location factor│                   │
│   └──────────┘  │ • Percentiles    │                   │
│      │          └──────────────────┘                   │
│      │                   │                              │
│      └─────────┬─────────┘                             │
│                │                                        │
│                ▼                                        │
│   ┌─────────────────────────────────┐                  │
│   │  Return: Low | Average | High   │                  │
│   │  + Confidence + Sample Size     │                  │
│   └─────────────────────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Recommendation Flow

```
┌─────────────────────────────────────────────────────────┐
│                   RECOMMENDATIONS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Input: Budget + Location + Bedrooms                    │
│        │                                                 │
│        ▼                                                 │
│   ┌─────────────────────────────────────────────┐       │
│   │           Get Location Stats                 │       │
│   │    (prices by bedroom for all areas)        │       │
│   └─────────────────────────────────────────────┘       │
│        │                                                 │
│        ├──────────────────┬──────────────────┐          │
│        │                  │                  │          │
│        ▼                  ▼                  ▼          │
│   ┌─────────┐      ┌──────────┐      ┌───────────┐     │
│   │ Cheaper │      │  Best    │      │  Upgrade  │     │
│   │   Alt   │      │  Deals   │      │  Options  │     │
│   │  <85%   │      │  <85%    │      │  +1 BR    │     │
│   │ current │      │  market  │      │  ≤110%    │     │
│   └─────────┘      └──────────┘      └───────────┘     │
│        │                  │                  │          │
│        └──────────────────┼──────────────────┘          │
│                           │                             │
│                           ▼                             │
│              ┌─────────────────────────┐               │
│              │   Return Top Results    │               │
│              │   (sorted by savings)   │               │
│              └─────────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Code References

| Function | File | Line |
|----------|------|------|
| `estimatePrice` | `lib/data.ts` | 38 |
| `getLocationStats` | `lib/data.ts` | 115 |
| `getBedroomDistribution` | `lib/data.ts` | 160 |
| `getPriceRanges` | `lib/data.ts` | 170 |
| `getRecommendations` | `lib/recommendations.ts` | 14 |

---

## Accuracy Notes

1. **Exact matches** provide the most accurate estimates
2. **Fallback estimates** use market data and should be treated as approximations
3. **Confidence scores** help users understand estimate reliability
4. **Recommendations** are filtered to show only meaningful suggestions (15%+ difference)

---

*Last updated: January 2026*
