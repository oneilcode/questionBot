require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const questions = require('./questions');

const app = express();
const token = process.env.TELEGRAM_BOT_TOKEN;

// Для Vercel важно использовать вебхуки вместо polling
const bot = new TelegramBot(token);
app.use(express.json());

// Фиктивный эндпоинт для проверки здоровья
app.get('/health', (req, res) => {
  res.status(200).send('Bot is alive');
});

// Эндпоинт для вебхука
app.post('/api', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ID чатов (храним массив, так как пользователей может быть несколько)
const chatIds = new Set();

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  chatIds.add(chatId);
  bot.sendMessage(chatId, 'Привет! Я буду присылать тебе случайный вопрос каждый день в 17:00 по Москве. Жди первый вопрос!');
});

// Функция отправки случайного вопроса
function sendDailyQuestion() {
  if (chatIds.size === 0) return;

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  chatIds.forEach(chatId => {
    bot.sendMessage(chatId, `❓ Вопрос дня: ${randomQuestion}`)
      .catch(err => console.error('Ошибка отправки:', err));
  });
}

// Настройка расписания на 17:00 по Москве (14:00 UTC)
const job = schedule.scheduleJob('0 14 * * *', sendDailyQuestion);

// Для Vercel важно экспортировать app
module.exports = app;

// Установка вебхука при запуске (для Vercel)
if (process.env.VERCEL_URL) {
  const webhookUrl = `${process.env.VERCEL_URL}/api`;
  bot.setWebHook(webhookUrl)
    .then(() => console.log('Webhook установлен на', webhookUrl))
    .catch(err => console.error('Ошибка вебхука:', err));
}

