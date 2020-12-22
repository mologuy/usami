const Discord = require("discord.js");
const BOT_INFO = require("./CONFIG.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;
const BOT_PREFIX = BOT_INFO.PREFIX;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`Commands: ${BOT_PREFIX}help`);
});

const commRegex = RegExp(`^${BOT_PREFIX.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\b\\S+\\b)(.*)`);

client.on('message', msg => {
    var commMatch = msg.content.match(commRegex);
    if (commMatch && !msg.author.bot) {
        console.log(commMatch[1]);
        switch (commMatch[1]) {
            case "ping":
                pingComm(msg);
                break;
            case "help":
                helpComm(msg, commMatch[2]);
                break;
            case "rules":
                rulesComm(msg);
                break;
            default:
                msg.channel.send(`Command not found: \`${commMatch[1]}\``);
                break;
        }
    }
});

function pingComm(msg) {
    msg.channel.send("pong");
}

function helpComm(msg, args) {
    msg.channel.send("help?");
}

function rulesComm(msg) {
    msg.channel.send("**Rules:**\n1. Don't be a dick\n2. DON'T BE A DICK\n3. Follow the rules\n4. Trans rights");
}

client.login(BOT_TOKEN);