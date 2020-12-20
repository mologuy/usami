const Discord = require("discord.js");
const BOT_INFO = require("./BOT_INFO.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    var commMatch = msg.content.match(/^\*(\b\S+\b)(.*)/);
    if (commMatch) {
        console.log(commMatch[1]);
        switch (commMatch[1]) {
            case "ping":
                pingComm(msg);
                break;
            case "help":
                helpComm(msg);
                break;
            default:
                msg.channel.send(`Command not found: ${commMatch[1]}`);
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

client.login(BOT_TOKEN);