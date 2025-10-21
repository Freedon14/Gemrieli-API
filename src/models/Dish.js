const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    photo_url: { type: String, trim: true },
    avg_rating: { type: Number, default: 0 },
    ratings_count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

DishSchema.index({ name: 1, restaurant: 1 }, { unique: false });

module.exports = mongoose.model('Dish', DishSchema);