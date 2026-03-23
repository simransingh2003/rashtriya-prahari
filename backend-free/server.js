const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const pool = require('./db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client for storage
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Rashtriya Prahari Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// GET all news
app.get('/api/v1/news', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY created_at DESC");
    res.json({ data: result.rows, message: "Fetched from database" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET breaking news
app.get('/api/v1/news/breaking', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news WHERE is_breaking = true");
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create article
app.post('/api/v1/news', async (req, res) => {
  try {
    const { title_hi, title_en, content, category, image_url, is_breaking } = req.body;
    const result = await pool.query(
      `INSERT INTO news (title_hi, title_en, content, category, image_url, is_breaking)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title_hi, title_en, content, category, image_url, is_breaking || false]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update article
app.put('/api/v1/news/:id', async (req, res) => {
  try {
    const { title_hi, title_en, content, category, image_url, is_breaking } = req.body;
    const result = await pool.query(
      `UPDATE news SET title_hi=$1, title_en=$2, content=$3, category=$4,
       image_url=$5, is_breaking=$6 WHERE id=$7 RETURNING *`,
      [title_hi, title_en, content, category, image_url, is_breaking, req.params.id]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - remove article
app.delete('/api/v1/news/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - upload image or PDF to Supabase Storage
app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });

    const fileName = `${Date.now()}-${file.originalname}`;
    const bucket = file.mimetype === 'application/pdf' ? 'pdfs' : 'images';

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rashtriya Prahari Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📰 News API: http://localhost:${PORT}/api/v1/news`);
});