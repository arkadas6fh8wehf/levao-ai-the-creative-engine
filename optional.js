/**
 * Optional Node.js Backend for Lepen AI
 * Deploy this separately to keep the server alive during idle periods.
 * 
 * Requirements:
 * - npm install express cors node-fetch
 * 
 * Usage:
 * - Set environment variables: SUPABASE_URL, SUPABASE_ANON_KEY
 * - Run: node optional.js
 * - Deploy to your preferred hosting (Render, Railway, Heroku, Vercel, etc.)
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eedtqzfatasqkakhyuua.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZHRxemZhdGFzcWtha2h5dXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTA0OTUsImV4cCI6MjA4MDkyNjQ5NX0.V1fgVtEdqN7RCt_hKw3KyfY0ND9y4HDo9hgR0RIP6jA';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lepen-ai-backend' });
});

// Ping endpoint for keep-alive
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Chat endpoint - proxy to Supabase Edge Function
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value, { stream: true }));
        }
        res.end();
      };
      
      pump().catch(err => {
        console.error('Stream error:', err);
        res.end();
      });
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Web search endpoint
app.post('/api/web-search', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/web-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Map search endpoint
app.post('/api/map-search', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/map-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Map search error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lepen AI Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
