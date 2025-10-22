require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./db');

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Dish = require('./models/Dish');
const Rating = require('./models/Rating');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({ name: 'Gemrieli API', status: 'ok', version: '1.0.0' });
});

function ensureAdmin(req, res) {
  const adminToken = process.env.ADMIN_TOKEN || '';
  const headerToken = req.header('x-admin-token') || '';
  if (!adminToken || headerToken !== adminToken) {
    res.status(401).json({ error: 'Unauthorized: invalid admin token' });
    return false;
  }
  return true;
}

// POST /rate — add a new rating
app.post('/rate', async (req, res) => {
  try {
    const { telegram_id, user_name, user_city, dish_id, rating, comment, photo_url } = req.body || {};
    if (!telegram_id || !dish_id || typeof rating !== 'number') {
      return res.status(400).json({ error: 'telegram_id, dish_id, and numeric rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    // Find or create user by telegram_id
    let user = await User.findOne({ telegram_id });
    if (!user) {
      user = await User.create({ telegram_id, name: user_name || undefined, city: user_city || undefined });
    } else {
      // update info if provided
      const updates = {};
      if (user_name && user_name !== user.name) updates.name = user_name;
      if (user_city && user_city !== user.city) updates.city = user_city;
      if (Object.keys(updates).length) {
        await User.updateOne({ _id: user._id }, { $set: updates });
      }
    }

    // Ensure dish exists
    const dish = await Dish.findById(dish_id).populate('restaurant');
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Create rating
    const newRating = await Rating.create({
      user: user._id,
      dish: dish._id,
      rating,
      comment,
      photo_url
    });

    // Update dish average rating and count
    const newCount = (dish.ratings_count || 0) + 1;
    const newAvg = (((dish.avg_rating || 0) * (dish.ratings_count || 0)) + rating) / newCount;
    dish.ratings_count = newCount;
    dish.avg_rating = Number(newAvg.toFixed(2));
    await dish.save();

    const populatedRating = await Rating.findById(newRating._id).populate('user').populate({ path: 'dish', populate: { path: 'restaurant' } });

    return res.status(201).json({
      rating: populatedRating,
      dish: dish
    });
  } catch (err) {
    console.error('POST /rate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /top?dish={dish_name}&city={city} — top 5 dishes by avg rating
app.get('/top', async (req, res) => {
  try {
    const { dish: dishName, city } = req.query;
    if (!dishName) {
      return res.status(400).json({ error: 'dish query parameter is required' });
    }

    const nameRegex = new RegExp(String(dishName), 'i');
    let dishes = await Dish.find({ name: nameRegex }).populate('restaurant');

    if (city) {
      const cityRegex = new RegExp(String(city), 'i');
      dishes = dishes.filter(d => d.restaurant && cityRegex.test(d.restaurant.city || ''));
    }

    dishes.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    const top5 = dishes.slice(0, 5);

    return res.json({ count: top5.length, results: top5 });
  } catch (err) {
    console.error('GET /top error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /restaurant/{id}/menu — list all dishes for a restaurant
app.get('/restaurant/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    const dishes = await Dish.find({ restaurant: restaurant._id }).sort({ name: 1 });
    return res.json({ restaurant, dishes });
  } catch (err) {
    console.error('GET /restaurant/:id/menu error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /add_dish — admin-only: add dish for a restaurant
app.post('/add_dish', async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return; // response already sent in ensureAdmin if unauthorized

    const { restaurant_id, name, category, photo_url } = req.body || {};
    if (!restaurant_id || !name) {
      return res.status(400).json({ error: 'restaurant_id and name are required' });
    }

    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const dish = await Dish.create({
      restaurant: restaurant._id,
      name,
      category,
      photo_url,
      avg_rating: 0,
      ratings_count: 0
    });

    return res.status(201).json({ dish });
  } catch (err) {
    console.error('POST /add_dish error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /user/{telegram_id}/ratings — user rating history
app.get('/user/:telegram_id/ratings', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const user = await User.findOne({ telegram_id });
    if (!user) {
      return res.json({ count: 0, ratings: [] });
    }

    const ratings = await Rating.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'dish', populate: { path: 'restaurant' } });

    return res.json({ count: ratings.length, ratings });
  } catch (err) {
    console.error('GET /user/:telegram_id/ratings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const port = process.env.PORT || 8080;

(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

// For Vercel serverless compatibility: export the app
module.exports = app;