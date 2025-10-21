import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  name: String,
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  city: String,
  dishes: [dishSchema],
});

// 🟢 Исправленный экспорт
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
