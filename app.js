const Discord = require("discord.js");
const util = require('minecraft-server-util');
const BOT_INFO = require("./CONFIG.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;
const BOT_PREFIX = BOT_INFO.PREFIX;
const MC_ROLE = BOT_INFO.MC_MOD_ROLE_NAME;
const MC_URL = BOT_INFO.MC_SERVER_URL;
const RCON_PASS = BOT_INFO.RCON_PASSWORD;

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
            case "whitelist":
                minecraftJoinComm(msg, commMatch[2]);
                break;
            case "rcon":
                minecraftRconComm(msg, commMatch[2]);
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
    argsMatch = args.match(/^\s*(\b\S+\b)(.*)/);
    if (argsMatch) {
        if (argsMatch[1] === "join") {
            minecraftJoinComm(msg, argsMatch[2]);
        }
        else if (argsMatch[1] === "rcon") {
            minecraftRconComm(msg,argsMatch[2]);
        }
        else {
            minecraftStatusComm(msg);
        }
    }
}

function minecraftStatusComm(msg) {
    util.status(MC_URL)
    .then((response) => {
        var msgEmbed = new Discord.MessageEmbed()
        .setColor('#228B22')
        .setTitle('Minecraft server info')
        .setThumbnail("https://static.mologuy.com/images/mc-server/minecraft_icon.png")
        .addFields(
            {
                name:"URL",
                value: response.host
            },
            {
                name: "Name",
                value: response.description,
            },
            {
                name: '\u200B',
                value: '\u200B'
            },
            {
                name:"Version",
                value: response.version.match(/\d+\.\d+\.\d+/),
                inline: true
            },
            {
                name:"Status",
                value: "Online",
                inline: true
            },
            {
                name:"Players",
                value: `${response.onlinePlayers}/${response.maxPlayers}`,
                inline: true
            },
            {
                name:"Subcommands",
                value: "`join`, `rcon`"
            }
        )
    
        msg.channel.send(msgEmbed);
    })
    .catch((error) => {
        msg.channel.send(`ERROR: ${error}`);
    });
}

function minecraftJoinComm(msg, args){
    argsMatch = args.match(/^\s*(\b\S+\b)(.*)/);
    if (argsMatch) {
        const rconClient = new util.RCON(MC_URL, {port: 25575, enableSRV: true, timeout: 5000, password: RCON_PASS});
        rconClient.on('output', (message) => {
            if (message != "") {
                console.log(message);
                msg.channel.send(message);
            }
            rconClient.close();
        });
        rconClient.connect()
        .then(()=>{
            var mcCommand = `whitelist add ${argsMatch[1]}`;
            rconClient.run(mcCommand);
        })
        .catch((error)=>{
            msg.channel.send(`ERROR: ${error}`);
        });
    }
    else {
        msg.channel.send("Command usage: `minecraft join <minecraft username>`")
    }
}

function minecraftRconComm(msg, args) {
    if (msg.member.roles.cache.some(role => role.name === MC_ROLE)){
        var argsMatch = args.match(/^\s*(\b\S+\b)\s*(.*)/)
        if (argsMatch) {
            const rconClient = new util.RCON(MC_URL, {port: 25575, enableSRV: true, timeout: 5000, password: RCON_PASS});
            rconClient.on('output', (message) => {
                console.log(message);
                msg.channel.send(`Server Response:\`\`\`\n${message} \`\`\``);
                rconClient.close();
            });
            rconClient.connect()
            .then(()=>{
                var mcCommand = `${argsMatch[1]} ${argsMatch[2]}`;
                rconClient.run(mcCommand);
            })
            .catch((error)=>{
                msg.channel.send(`CONNECTION ERROR: ${error}`);
            });
        }
        else {
            msg.channel.send("Command usage: `minecraft rcon <remote command> [<remote args>...]`");
        }
    }
    else {
        msg.reply(`You need the role "${MC_ROLE}" to use this command`);
    }
}

client.login(BOT_TOKEN);