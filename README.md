# ChatGPT Analytics Dashboard

A React-based dashboard for analyzing your ChatGPT conversation data. Upload your ChatGPT export file and get insights into your usage patterns, message statistics, and trends over time.

## Features

- 📊 **Comprehensive Analytics**: View total conversations, messages, and usage trends
- 📈 **Interactive Charts**: Beautiful visualizations using Recharts
- 🗃️ **Client-side Processing**: Uses DuckDB WASM for fast, local data processing
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Data Export**: Export your analytics as CSV
- 🔒 **Privacy First**: All processing happens in your browser - no data sent to servers

## How to Use

1. **Get Your ChatGPT Data**:
   - Go to ChatGPT Settings → Data controls
   - Click "Export data"
   - Wait for the email with your data export
   - Extract the ZIP file

2. **Upload and Analyze**:
   - Visit the dashboard
   - Upload your `conversations.json` file
   - Explore your analytics!

## Analytics Included

- Total conversations and messages
- Daily and monthly activity trends
- Message distribution (user vs assistant)
- Model usage statistics
- Average messages per conversation
- Longest conversation details

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **DuckDB WASM** for client-side data processing
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Deployment

This app is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Deploy with default settings
3. The app will be available at your Vercel URL

## Privacy & Security

- ✅ All data processing happens locally in your browser
- ✅ No data is sent to external servers
- ✅ Your conversations remain private
- ✅ No analytics or tracking

## File Size Support

The dashboard can handle large ChatGPT export files (100MB+ tested) efficiently using streaming JSON parsing and DuckDB's columnar processing.
