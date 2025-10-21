import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const API_URL = "https://gemrielibot.onrender.com/api";

// 🟢 /start — მისალმება
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const logo = "https://i.ibb.co/6vqtX6B/gemrieli-logo.png"; // ჩაანაცვლე შენს ლოგოთი

  const welcomeText = `
👋 კეთილი იყოს შენი მობრძანება *Gemrieli*-ში!  
აღმოაჩინე საუკეთესო კერძები შენს ქალაქში 🍽️  

აირჩიე ქალაქი 👇
`;

  await bot.sendPhoto(chatId, logo, { caption: welcomeText, parse_mode: "Markdown" });

  bot.sendMessage(chatId, "🏙️ აირჩიე ქალაქი:", {
    reply_markup: {
      keyboard: [["ბათუმი", "თბილისი"]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// 🟢 ქალაქის არჩევა
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "ბათუმი" || text === "თბილისი") {
    bot.sendMessage(chatId, `✅ არჩეული ქალაქი: *${text}*`, { parse_mode: "Markdown" });
    showMainMenu(chatId, text);
  }
});

// 🟢 მთავარი მენიუ
function showMainMenu(chatId, city) {
  bot.sendMessage(chatId, `🍽️ რას იზამ *${city}*-ში?`, {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [["🏆 ტოპ კერძები", "🔍 მოძებნე კერძი"], ["⭐ შეაფასე კერძი", "ℹ️ შესახებ"]],
      resize_keyboard: true,
    },
  });
}
