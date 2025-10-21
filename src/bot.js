import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const API_URL = "https://gemrielibot.onrender.com/api";

// /start — приветствие
bot.onText(/\/start/, (msg) => {
  const text = `
👋 Welcome to *Gemrieli*!  
Discover the best-rated dishes in your city 🍽️  
Try: /top burger or /top steak
`;
  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});

// /top <dish> — поиск по блюду
bot.onText(/\/top (.+)/, async (msg, match) => {
  const dish = match[1];
  const chatId = msg.chat.id;

  try {
    const res = await axios.get(`${API_URL}/top?dish=${dish}&city=Batumi`);
    const data = res.data.results;

    if (!data || data.length === 0) {
      return bot.sendMessage(chatId, `😔 No results found for *${dish}* in Batumi.`, { parse_mode: "Markdown" });
    }

    let reply = `🍴 *Top places for ${dish}:*\n\n`;
    data.forEach((item, i) => {
      reply += `${i + 1}. ${item.restaurant} — ⭐ ${item.bestDish.rating}\n`;
    });

    bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Bot error:", error.message);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again later.");
  }
});
