const Discord = require("discord.js");
const BOT_INFO = require("./BOT_INFO.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    var commMatch = msg.content.match(/^\*(\b\S+\b)(.*)/);
    if (commMatch && !msg.author.bot) {
        console.log(commMatch[1]);
        switch (commMatch[1]) {
            case "ping":
                pingComm(msg);
                break;
            case "help":
                helpComm(msg);
                break;
            case "rules":
                rulesComm(msg);
                break;
            default:
                console.log(`Command not found: ${commMatch[1]}`);
                break;
        }
    }
});

function pingComm(msg) {
    msg.channel.send("pong");
}

function helpComm(msg) {
    msg.channel.send("help?");
}

function rulesComm(msg) {
    msg.channel.send("**Rules:**\n1. Don't be a dick\n2. DON'T BE A DICK\n3. Follow the rules\n4. Trans rights");
}

client.login(BOT_TOKEN);