require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const questions = require('./questions');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

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

console.log('Бот запущен!');

