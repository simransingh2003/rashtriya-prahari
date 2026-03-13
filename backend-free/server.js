const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Rashtriya Prahari Backend is running!',
    timestamp: new Date().toISOString() 
  });
});

// Sample news API endpoint
app.get('/api/v1/news', (req, res) => {
  res.json({ 
    data: [
      {
        id: 1,
        title_hi: 'नमूना समाचार शीर्षक',
        title_en: 'Sample News Article',
        content_hi: 'यह एक परीक्षण लेख है',
        content_en: 'This is a test article',
        category: 'Politics',
        publish_date: new Date().toISOString()
      }
    ],
    message: 'Sample data - database not connected yet'
  });
});

// Breaking news endpoint
app.get('/api/v1/news/breaking', (req, res) => {
  res.json({ 
    data: [
      {
        id: 1,
        title_hi: 'ब्रेकिंग न्यूज़ शीर्षक',
        title_en: 'Breaking News Headline',
        is_breaking: true
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rashtriya Prahari Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📰 News API: http://localhost:${PORT}/api/v1/news`);
});




PORT=3000
NODE_ENV=production