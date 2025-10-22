import mongoose from "mongoose";
import { Restaurant } from "./models/Restaurant.js";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const data = [
  {
    name: "Burger House",
    city: "Batumi",
    dishes: [
      { name: "Classic Burger", rating: 4.8, reviews: 15 },
      { name: "Cheese Burger", rating: 4.6, reviews: 9 }
    ]
  },
  {
    name: "Meat & Beer",
    city: "Batumi",
    dishes: [
      { name: "Beef Steak", rating: 4.9, reviews: 22 },
      { name: "Pork Ribs", rating: 4.7, reviews: 11 }
    ]
  }
];

await Restaurant.insertMany(data);
console.log("✅ Data inserted!");
mongoose.connection.close();
