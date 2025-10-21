const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.send('Gemrieli API is running ✅');
});

// Example endpoint
app.get('/api/top', (req, res) => {
  const { dish = 'burger', city = 'Batumi' } = req.query;
  res.json({
    dish,
    city,
    topRestaurants: [
      { name: 'Burger House', rating: 4.9 },
      { name: 'Meat & Beer', rating: 4.8 },
      { name: 'Batumi Grill', rating: 4.7 },
    ],
  });
});

// ✅ Export app for Vercel
module.exports = app;
