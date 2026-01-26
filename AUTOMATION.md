# Data Automation Guide

This guide explains how to set up automated data scraping for Accra Rentals.

## Overview

The scraper runs automatically via GitHub Actions and:
1. Scrapes rental listings from Meqasa.com
2. Saves updated data to `public/meqasa_data.json`
3. Commits and pushes changes to the repository
4. Triggers automatic deployment (if configured)

## GitHub Actions Setup

### Automatic Schedule

The scraper runs automatically every day at **6:00 AM UTC (9:00 AM Ghana time)**.

This is configured in `.github/workflows/scrape-data.yml`:
```yaml
schedule:
  - cron: '0 6 * * *'  # Daily at 6 AM UTC
```

### Changing the Schedule

To modify the schedule, edit the cron expression:

| Schedule | Cron Expression |
|----------|-----------------|
| Daily at 6 AM UTC | `0 6 * * *` |
| Twice daily (6 AM & 6 PM) | `0 6,18 * * *` |
| Every 12 hours | `0 */12 * * *` |
| Weekly (Sundays) | `0 6 * * 0` |
| Every 6 hours | `0 */6 * * *` |

### Manual Trigger

You can manually run the scraper anytime:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **"Scrape Rental Data"** workflow
4. Click **"Run workflow"**
5. Optionally specify number of pages to scrape
6. Click **"Run workflow"** (green button)

## Repository Setup

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. If not:
1. Go to **Settings** > **Actions** > **General**
2. Select **"Allow all actions and reusable workflows"**
3. Save

### 2. Configure Permissions

The workflow needs permission to push commits:
1. Go to **Settings** > **Actions** > **General**
2. Scroll to **"Workflow permissions"**
3. Select **"Read and write permissions"**
4. Check **"Allow GitHub Actions to create and approve pull requests"**
5. Save

### 3. (Optional) Add Vercel Deployment

To auto-deploy after scraping:

1. Get your Vercel credentials:
   - `VERCEL_TOKEN`: From Vercel Dashboard > Settings > Tokens
   - `VERCEL_ORG_ID`: From Vercel project settings
   - `VERCEL_PROJECT_ID`: From Vercel project settings

2. Add secrets to GitHub:
   - Go to **Settings** > **Secrets and variables** > **Actions**
   - Add each secret

3. Uncomment the deploy job in `.github/workflows/scrape-data.yml`

## Running Locally

### Prerequisites

```bash
# Install Python 3.11+
python --version

# Install dependencies
cd scrapper
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

### Run the Scraper

```bash
# From the scrapper directory
cd scrapper
python meqasa_working_scraper.py

# Or with custom output path
python meqasa_working_scraper.py --output /path/to/output.json
```

The data will be saved directly to `public/meqasa_data.json`.

## Monitoring

### Check Workflow Status

1. Go to **Actions** tab in your GitHub repository
2. View recent workflow runs
3. Click on a run to see detailed logs

### Workflow Summary

Each run generates a summary showing:
- Total listings scraped
- Scrape timestamp
- Success/failure status

### Notifications

To receive notifications on failure:
1. Go to **Settings** > **Notifications**
2. Enable **"Actions"** notifications
3. Or add email notification to the workflow

## Troubleshooting

### Common Issues

#### "No listings found"
- Meqasa may have changed their HTML structure
- Check if the website is accessible
- Review the selector in `meqasa_working_scraper.py`

#### "Permission denied" on commit
- Ensure workflow permissions are set to "Read and write"
- Check if branch protection rules allow GitHub Actions

#### Workflow not running on schedule
- GitHub disables scheduled workflows on inactive repos
- Make at least one commit every 60 days
- Or manually trigger the workflow periodically

### Debugging

Enable verbose output by checking the workflow logs:
1. Click on the failed run
2. Expand the **"Run scraper"** step
3. Review the full output

## Data Format

The scraper outputs JSON in this format:

```json
{
  "scraped_at": "2026-01-23T09:00:00.000000",
  "total_listings": 150,
  "source": "meqasa",
  "listings": [
    {
      "title": "2 bedroom apartment for rent in Osu",
      "price": 5000,
      "price_text": "GH₵5,000",
      "bedrooms": 2,
      "location": "Osu",
      "url": "https://meqasa.com/...",
      "source": "meqasa",
      "scraped_at": "2026-01-23T09:00:00.000000",
      "page": 1
    }
  ]
}
```

## Cost

- **GitHub Actions**: Free for public repos, 2000 min/month for private repos
- **Scraper runtime**: ~10-15 minutes per run
- **Monthly cost**: Free for most use cases

## Support

If you encounter issues:
1. Check the workflow logs
2. Review recent changes to Meqasa website
3. Open an issue in the repository
