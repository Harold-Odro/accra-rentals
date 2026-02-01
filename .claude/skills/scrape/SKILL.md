---
name: scrape
description: Run the Meqasa data scraper to update rental listings
disable-model-invocation: true
allowed-tools: Bash(python*), Bash(cd scrapper*), Read
---

# Run Data Scraper

Execute the Meqasa scraper to fetch fresh rental data.

## Prerequisites

- Python 3.8+ installed
- Playwright installed: `pip install playwright && playwright install chromium`

## Scraper Options

### Fast Parallel Scraper (Recommended)
```bash
python scrapper/meqasa_parallel_scraper.py --workers 4 --pages 10
```

Options:
- `--workers 4` - Number of parallel browser instances (default: 4)
- `--pages 10` - Max pages per area (default: 10)
- `--output path` - Custom output path

### Original Sequential Scraper
```bash
python scrapper/meqasa_working_scraper.py --pages 10
```

## Performance Comparison

| Scraper | Time | Speed |
|---------|------|-------|
| Sequential | ~30-60 min | 1x |
| Parallel (4 workers) | ~5-10 min | 5-6x faster |

## Steps

1. Activate virtual environment if exists: `source scrapper/.venv/bin/activate`
2. Run the parallel scraper with desired options
3. Verify output in `public/meqasa_data.json`
4. Report statistics from output

## Error Handling

If scraper fails:
- Check for rate limiting (429 errors)
- Reduce workers: `--workers 2`
- Verify network connectivity
- Check if Meqasa site structure changed

## Output

Report:
- Number of new listings
- Time elapsed
- Neighborhoods covered
- Price range found
