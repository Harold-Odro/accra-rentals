// lib/export.ts

export interface EstimateData {
  location: string
  bedrooms: number
  estimate: {
    low: number
    average: number
    high: number
    confidence: string
    count: number
  }
}

export function generateShareableLink(data: EstimateData): string {
  const params = new URLSearchParams({
    location: data.location,
    bedrooms: data.bedrooms.toString(),
    low: data.estimate.low.toString(),
    avg: data.estimate.average.toString(),
    high: data.estimate.high.toString(),
    conf: data.estimate.confidence,
    count: data.estimate.count.toString()
  })
  
  return `${window.location.origin}?${params.toString()}`
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function downloadAsImage(_elementId: string, _filename: string = 'accra-rentals-estimate.png') {
  // This would use html2canvas library in production
  // For now, we'll provide a text-based export
  // Parameters prefixed with _ to indicate intentionally unused (future implementation)
  alert('Image export feature coming soon! For now, use the "Copy" or "Share Link" options.')
}

export function exportToPDF(data: EstimateData) {
  // Create a printable version
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export PDF')
    return
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Accra Rentals - Price Estimate</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          color: #262626;
        }
        .header {
          border-bottom: 3px solid #ef4444;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        h1 {
          font-size: 32px;
          margin: 0 0 10px 0;
          color: #171717;
        }
        .subtitle {
          color: #737373;
          font-size: 14px;
        }
        .estimate-card {
          background: linear-gradient(135deg, #fef2f2 0%, #fefce8 100%);
          border: 1px solid #fee2e2;
          border-radius: 12px;
          padding: 30px;
          margin: 20px 0;
        }
        .property-details {
          font-size: 18px;
          color: #404040;
          margin-bottom: 20px;
        }
        .price-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .price-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .price-label {
          font-size: 12px;
          color: #737373;
          margin-bottom: 8px;
        }
        .price-value {
          font-size: 28px;
          font-weight: bold;
          color: #171717;
        }
        .average {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }
        .average .price-label {
          color: rgba(255,255,255,0.8);
        }
        .average .price-value {
          color: white;
        }
        .confidence {
          margin-top: 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          text-align: center;
          color: #737373;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏠 Accra Rentals</h1>
        <div class="subtitle">Rental Price Estimate Report</div>
      </div>
      
      <div class="estimate-card">
        <div class="property-details">
          <strong>${data.bedrooms} Bedroom${data.bedrooms > 1 ? 's' : ''}</strong> in <strong>${data.location}</strong>
        </div>
        
        <div class="price-grid">
          <div class="price-box">
            <div class="price-label">Low</div>
            <div class="price-value">GH₵${data.estimate.low.toLocaleString()}</div>
          </div>
          
          <div class="price-box average">
            <div class="price-label">Average</div>
            <div class="price-value">GH₵${data.estimate.average.toLocaleString()}</div>
          </div>
          
          <div class="price-box">
            <div class="price-label">High</div>
            <div class="price-value">GH₵${data.estimate.high.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="confidence">
          <div>
            <strong>${data.estimate.confidence.charAt(0).toUpperCase() + data.estimate.confidence.slice(1)} Confidence</strong>
          </div>
          <div>
            Based on ${data.estimate.count} listings
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>AccraRentals.com - Accurate rental price intelligence for Greater Accra</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
}

export function generateTextSummary(data: EstimateData): string {
  return `
🏠 Accra Rentals - Price Estimate

Property: ${data.bedrooms} bedroom${data.bedrooms > 1 ? 's' : ''} in ${data.location}

💰 Estimated Monthly Rent:
• Low:     GH₵${data.estimate.low.toLocaleString()}
• Average: GH₵${data.estimate.average.toLocaleString()}
• High:    GH₵${data.estimate.high.toLocaleString()}

📊 Confidence: ${data.estimate.confidence.charAt(0).toUpperCase() + data.estimate.confidence.slice(1)}
📈 Based on ${data.estimate.count} similar listings

Generated: ${new Date().toLocaleDateString()}
Visit: AccraRentals.com for more insights
  `.trim()
}