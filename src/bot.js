import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const API_URL = "https://gemrielibot.onrender.com/api";

// 🟢 Приветствие и кнопка "სტარტი"
bot.onText(/\/start|სტარტი/i, async (msg) => {
  const chatId = msg.chat.id;
  const logo = "./logo.jpg"; // замени на свой логотип

  const welcomeText = `
👋 კეთილი იყოს შენი მობრძანება *Gemrieli*-ში!  
აღმოაჩინე საუკეთესო კერძები შენს ქალაქში 🍽️  
`;

  await bot.sendPhoto(chatId, logo, { caption: welcomeText, parse_mode: "Markdown" });

  // Отображаем основное меню сразу
  showMainMenu(chatId);
});

// 🟢 Главное меню
function showMainMenu(chatId) {
  bot.sendMessage(chatId, "🍽️ აირჩიე მოქმედება:", {
    reply_markup: {
      keyboard: [
        ["🏆 ტოპ კერძები", "🔍 მოძებნე კერძი"],
        ["⭐ შეაფასე კერძი", "ℹ️ შესახებ"],
      ],
      resize_keyboard: true,
    },
  });
}

// 🟢 Топ კერძები
bot.onText(/ტოპ კერძები/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const res = await axios.get(`${API_URL}/top?dish=burger&city=Batumi`);
    const data = res.data.results;

    if (!data || data.length === 0) {
      return bot.sendMessage(chatId, "😔 ტოპ კერძები ჯერ არ არის ხელმისაწვდომი.");
    }

    let reply = "🏆 *საუკეთესო კერძები ბათუმში:*\n\n";
    data.forEach((item, i) => {
      reply += `${i + 1}. ${item.restaurant} — ⭐ ${item.bestDish.rating}\n`;
    });

    bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Bot error:", error.message);
    bot.sendMessage(chatId, "⚠️ მოხდა შეცდომა. სცადე მოგვიანებით.");
  }
});

// 🟢 ინფორმაცია / შესახებ
bot.onText(/შესახებ/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `
ℹ️ *Gemrieli* — აპლიკაცია და ბოტი, რომელიც გეხმარება აღმოაჩინო საუკეთესო კერძები შენს ქალაქში!  
შეაფასე, შეადარე და აირჩიე საუკეთესო 🍴
`,
    { parse_mode: "Markdown" }
  );
});

// 🟢 საძიებო (simple placeholder)
bot.onText(/მოძებნე კერძი/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔍 უბრალოდ ჩაწერე კერძის სახელი, მაგალითად: *ბურგერი*", {
    parse_mode: "Markdown",
  });
});

// 🟢 რეიტინგი (placeholder)
bot.onText(/შეაფასე კერძი/, (msg) => {
  bot.sendMessage(msg.chat.id, "⭐ ფუნქცია მალე დაემატება — შეგიძლია შეაფასო კერძი 1-დან 5-მდე!");
});
