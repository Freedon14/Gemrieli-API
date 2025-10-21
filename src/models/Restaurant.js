const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    social_links: [{ type: String }],
    website: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', RestaurantSchema);