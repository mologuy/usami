const Discord = require("discord.js");
const util = require('minecraft-server-util');
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
        console.log(`Command recieved: ${commMatch[1]}`);
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
            case "minecraft":
                minecraftComm(msg, commMatch[2]);
                break;
            case "rcon":
                rconComm(msg, commMatch[2]);
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
    msg.channel.send("ask molo");
}

function rulesComm(msg) {
    msg.channel.send("**Rules:**\n1. Don't be a dick\n2. DON'T BE A DICK\n3. Follow the rules\n4. Trans rights");
}

function minecraftComm(msg, args) {
    var msgEmbed = new Discord.MessageEmbed()
    .setColor('#228B22')
    .setTitle('Minecraft server info')
    .setThumbnail("https://static.mologuy.com/images/mc-server/minecraft_icon.png")
    .addFields(
        {
            name:"URL",
            value: "mc.mologuy.com"
        },
        {
            name: "Name",
            value: "Molo's Server OwO",
        },
        {
            name: '\u200B',
            value: '\u200B'
        },
        {
            name:"Version",
            value: "1.16.4",
            inline: true
        },
        {
            name:"Players",
            value: "0/10",
            inline: true
        },
        {
            name:"Gamemode",
            value: "survival",
            inline: true
        },
        {
            name:"Related Commands",
            value: "`whitelist`, `rcon`"
        }
    )

    msg.channel.send(msgEmbed);
}

function rconComm(msg, args) {
    var argsMatch = args.match(/^\s+(\b\S+\b)\s*(.*)/)
    if (argsMatch) {
        //TODO
    }
    else {
        msg.channel.send("Command usage: `rcon REMOTE_COMMAND [REMOTE_ARGS...]`");
    }
}

client.login(BOT_TOKEN);