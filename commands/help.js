const BOT_INFO = require("../CONFIG.json");

async function command(msg, args) {
    await msg.channel.send("ask molo");
}

module.exports = {command: command};