// Добавьте в начало bot.js
const express = require('express');
const app = express();

// Фиктивный эндпоинт для проверки здоровья
app.get('/health', (req, res) => {
  res.status(200).send('Bot is alive');
});

// Запуск на порту из переменной среды (Render сам назначает PORT)
// app.listen(process.env.PORT || 3000, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });


require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const questions = require('./questions');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);
app.use(express.json());

// ID вашего чата (узнаете, отправив боту /start)
let chatId = null;

// Команда /start
bot.onText(/\/start/, (msg) => {
  chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Я буду присылать тебе случайный вопрос каждый день. Жди первый вопрос завтра!');
});

// Функция отправки случайного вопроса
function sendDailyQuestion() {
  if (!chatId) return;

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  bot.sendMessage(chatId, `❓ Вопрос дня: ${randomQuestion}`);
}

// Запуск ежедневной отправки (в 10:00 утра)
const schedule = require('node-schedule');
const job = schedule.scheduleJob('0 10 * * *', sendDailyQuestion); // Каждый день в 10:00


