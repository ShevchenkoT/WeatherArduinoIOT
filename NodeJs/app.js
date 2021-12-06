const awsIot = require('aws-iot-device-sdk');
const { Telegraf } = require('telegraf');
const { Keyboard } = require('telegram-keyboard');
const bot = new Telegraf('YOUR_TOKEN'); // telegram bot token

// IoT certificates
const device = awsIot.device({
  keyPath: 'KEY_PATH-private.pem.key',
  certPath: 'CERT_PATH-certificate.pem.crt',
  caPath: 'rootCA.pem',
  clientId: 'CLIENT_ID',
  host: 'ENDPOINT'
});

// subscribe to topic
device.on('connect', (topic, payload) => {
  console.log('connect');
  device.subscribe('$aws/things/YOR_THING/shadow/update');
  device.publish(
    '$aws/things/YOR_THING/shadow/update',
    JSON.stringify({ connectionToIot: 'done' })
  );
});

let lastMessage = 'Offline...';
// message form IoT
device.on('message', (topic, payload) => {
  lastMessage = payload.toString();
  console.log(lastMessage);
});

// bot response to command /start
bot.start((ctx) => {
  return ctx.reply(
    `Hello ${ctx.message.from.first_name}!`,
    myKeyboard().reply()
  );
});

// bot response to any text
bot.on('text', async (ctx) => {
  await ctx.telegram.sendMessage(
    ctx.message.chat.id,
    lastMessage,
    myKeyboard().reply()
  );
});

// function for create keyboard
function myKeyboard() {
  return Keyboard.make([['Get Temperature and Humidity']]);
}

// bot start
bot.launch();

console.log('Bot started....');
