import "./bot.js";
import { connectDB } from "./db.js";
import { Restaurant } from "./models/Restaurant.js";
import dotenv from "dotenv";

dotenv.config();
await connectDB();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { restaurants } from "./data/mockData.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// 🟢 Главная проверка
app.get("/", (req, res) => {
  res.json({ message: "Gemrieli API is running ✅" });
});

// 🍔 ТОП блюд
app.get("/api/top", (req, res) => {
  const { dish = "", city = "Batumi" } = req.query;
  const results = restaurants
    .filter((r) => r.city.toLowerCase() === city.toLowerCase())
    .map((r) => ({
      restaurant: r.name,
      bestDish: r.menu.find((m) =>
        m.name.toLowerCase().includes(dish.toLowerCase())
      ),
    }))
    .filter((item) => item.bestDish);

  res.json({ city, dish, results });
});

// 🏠 Все рестораны
app.get("/api/restaurants", (req, res) => {
  const { city } = req.query;
  const list = city
    ? restaurants.filter((r) => r.city.toLowerCase() === city.toLowerCase())
    : restaurants;
  res.json(list);
});

// 🍽️ Информация о конкретном блюде
app.get("/api/dish/:name", (req, res) => {
  const { name } = req.params;
  const dishes = [];

  restaurants.forEach((r) => {
    r.menu.forEach((m) => {
      if (m.name.toLowerCase().includes(name.toLowerCase())) {
        dishes.push({
          restaurant: r.name,
          city: r.city,
          dish: m.name,
          rating: m.rating,
        });
      }
    });
  });

  if (dishes.length === 0)
    return res.status(404).json({ message: "Dish not found" });

  res.json(dishes);
});

// ⭐ Добавление рейтинга блюду
app.post("/api/rate", (req, res) => {
  const { restaurantId, dishName, rating } = req.body;
  const restaurant = restaurants.find((r) => r.id === restaurantId);

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  const dish = restaurant.menu.find(
    (m) => m.name.toLowerCase() === dishName.toLowerCase()
  );

  if (!dish) return res.status(404).json({ message: "Dish not found" });

  // Простейшая модель перерасчета рейтинга
  dish.reviews += 1;
  dish.rating = (dish.rating * (dish.reviews - 1) + rating) / dish.reviews;

  res.json({ message: "Rating added", dish });
});

app.listen(port, () => {
  console.log(`🚀 Gemrieli API running on port ${port}`);
});
// 📍 Добавление ресторана
app.post("/api/restaurants", async (req, res) => {
  const { name, city, dishes } = req.body;
  const restaurant = new Restaurant({ name, city, dishes });
  await restaurant.save();
  res.json({ message: "Restaurant added", restaurant });
});
