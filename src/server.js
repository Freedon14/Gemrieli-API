import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Gemrieli API is running ✅" });
});

app.get("/api/top", (req, res) => {
  res.json({
    dish: "burger",
    city: "Batumi",
    topRestaurants: [
      { name: "Burger House", rating: 4.9 },
      { name: "Meat & Beer", rating: 4.8 },
      { name: "Batumi Grill", rating: 4.7 },
    ],
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
app.get("/api/top", (req, res) => {
  const { dish = "burger", city = "Batumi" } = req.query;

  res.json({
    dish,
    city,
    topRestaurants: [
      { name: "Burger House", rating: 4.9 },
      { name: "Meat & Beer", rating: 4.8 },
      { name: "Batumi Grill", rating: 4.7 },
    ],
  });
});
