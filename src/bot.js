import TelegramBot from "node-telegram-bot-api";
import { Restaurant } from "./models/Restaurant.js";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 Welcome to Gemrieli!\nType /top burger to see best burgers in Batumi 🍔");
});

bot.onText(/\/top (.+)/, async (msg, match) => {
  const dish = match[1];
  const restaurants = await Restaurant.find({ "dishes.name": new RegExp(dish, "i") });

  if (restaurants.length === 0) {
    return bot.sendMessage(msg.chat.id, `No results for "${dish}" 😢`);
  }

  let reply = `🔥 Top places for *${dish}*:\n\n`;
  restaurants.forEach((r) => {
    const found = r.dishes.find((d) => d.name.toLowerCase().includes(dish.toLowerCase()));
    if (found) {
      reply += `🍽️ ${r.name} (${r.city}) — ⭐ ${found.rating.toFixed(1)} (${found.reviews} reviews)\n`;
    }
  });

  bot.sendMessage(msg.chat.id, reply, { parse_mode: "Markdown" });
});
