const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
require('dotenv').config({ path: './.env' });
console.log("ENV PATH CHECK:", process.cwd());
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log("Health endpoint hit"); 
  res.json({ 
    status: 'ok', 
    message: 'Rashtriya Prahari Backend is running!',
    timestamp: new Date().toISOString() 
  });
});

// news API endpoint
app.get('/api/v1/news', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY created_at DESC");
    
    res.json({
      data: result.rows,
      message: "Fetched from database"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// breaking news API endpoint

app.get('/api/v1/news/breaking', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM news WHERE is_breaking = true"
    );

    res.json({ data: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rashtriya Prahari Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📰 News API: http://localhost:${PORT}/api/v1/news`);
});