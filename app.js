const Discord = require("discord.js");
const BOT_INFO = require("./BOT_INFO.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    var commMatch = msg.content.match(/^\*(\b\S+\b)(.*)/);
    if (commMatch) {
        console.log(commMatch[1]);
        switch (commMatch[1]) {
            case "ping":
                pingCom(msg);
                break;
            default:
                msg.channel.send(`Command: ${commMatch[1]}\nArgs: ${commMatch[2]}`);
                break;
        }
    }
});

function pingCom(msg) {
    msg.channel.send("pong!");
}

client.login(BOT_TOKEN);