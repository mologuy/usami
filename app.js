const Discord = require("discord.js");
const util = require('minecraft-server-util');

const BOT_INFO = require("./CONFIG.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;
const BOT_PREFIX = BOT_INFO.PREFIX;
const MC_ROLE = BOT_INFO.MC_MOD_ROLE_NAME;
const MC_URL = BOT_INFO.MC_SERVER_HOSTNAME;
const MC_PORT = BOT_INFO.MC_SERVER_PORT;
const RCON_PASS = BOT_INFO.RCON_PASSWORD;
const RCON_PORT = BOT_INFO.RCON_PORT;
const CHAT_ENABLED = BOT_INFO.MC_CHAT_ENABLED;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`Commands: ${BOT_PREFIX}help`);
    if (BOT_INFO.CONSOLE_ENABLED) {
        const consoleUrl = new URL("http://localhost");
        consoleUrl.hostname = MC_URL;
        consoleUrl.port = BOT_INFO.MC_CONSOLE_PORT;
        const socket = require("socket.io-client")(consoleUrl.toString());
        client.channels.fetch(BOT_INFO.MC_CONSOLE_CHANNEL_ID)
        .then((channel)=>{
            socket.on("connect", ()=> {
                channel.send("Socket connected");
            });
            socket.on("disconnect", ()=> {
                channel.send("Socket disconnected");
            });
            socket.on("console",(data)=>{
                var match = data.match(/^[^\u001b]+/);
                if (match) {
                    channel.send(match);
                    if (CHAT_ENABLED) {
                        chatMatch = match[0].match(/INFO\]\:\s*\<(.+)\>\s*(.+)/);
                        if (chatMatch) {
                            client.channels.fetch(BOT_INFO.MC_CHAT_CHANNEL)
                            .then((chatchannel)=>{
                                var chatmsg = `[Minecraft Server] **${chatMatch[1]}**: ${chatMatch[2]}`;
                                chatchannel.send(chatmsg);
                            })
                        }
                    }
                }
            })
        })
        .catch((error)=>{
            console.log("error finding channel",error);
        })
        socket.on("connect", ()=>{
            console.log(`Connected to the socket on ${consoleUrl}`);
        })
    }
});

const commRegex = RegExp(`^${BOT_PREFIX.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\b\\S+\\b)(.*)`);

client.on('message', msg => {
    if (!msg.author.bot && !msg.webhookID) {
        var commMatch = msg.content.match(commRegex);
        if (commMatch) {
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
        else if (msg.channel.id == BOT_INFO.MC_CONSOLE_CHANNEL_ID){
            minecraftRconComm(msg,msg.content);
        }
        else if (CHAT_ENABLED && msg.channel.id == BOT_INFO.MC_CHAT_CHANNEL) {
            var tellraw_obj = [{text: "[", bold: true},{text: "Discord", bold: true, color: "light_purple"},{text: "] ", bold: true}, {text: `<${msg.author.username}> ${msg.content}`, bold: false}];
            var tellraw_msg = `tellraw @a ${JSON.stringify(tellraw_obj)}`;
            minecraftRconComm(msg, tellraw_msg, true);
        }
        else {
            var dadMatch = msg.content.match(/^(i\W*m|i\s+am)\s+(.*)/i);
            var sixNineMatch = msg.content.match(/.*69.*/i);
            var spoilerMatch = msg.content.match(/.*spoiler.*/i);
            if (dadMatch) {
                dadComm(msg,dadMatch[2]);
            }
            if (sixNineMatch) {
                sixNineComm(msg);
            }
            if (spoilerMatch && msg.attachments.size == 1) {
                spoilerComm(msg);
            }
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
    //console.log(argsMatch);
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
    else {
        minecraftStatusComm(msg);
    }
}

function minecraftStatusComm(msg) {
    util.status(MC_URL, {port: MC_PORT})
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

function minecraftJoinComm(msg, args, silent = false){
    argsMatch = args.match(/^\s*(\b\S+\b)(.*)/);
    if (argsMatch) {
        const rconClient = new util.RCON(MC_URL, {port: RCON_PORT, enableSRV: true, timeout: 5000, password: RCON_PASS});
        rconClient.on('output', (message) => {
            if (message != "" && !silent) {
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

function minecraftRconComm(msg, args, silent = false) {
    if (msg.member.roles.cache.some(role => role.name === MC_ROLE)){
        var argsMatch = args.match(/^\s*(\b\S+\b)\s*(.*)/)
        if (argsMatch) {
            const rconClient = new util.RCON(MC_URL, {port: RCON_PORT, enableSRV: true, timeout: 5000, password: RCON_PASS});
            rconClient.on('output', (message) => {
                console.log(message);
                if (!silent)
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

function dadComm(msg, name) {
    msg.channel.createWebhook(`${msg.author.username}'s dad`, {avatar: "https://static.mologuy.com/images/discord/dad_pfp.jpg"})
    .then((webhook)=>{
        let output;
        if (name.match(/^\W*dad\W*$/i)){
            output = `No you're not. You're ${msg.author.username}!`
        }
        else {
            output = `Hi, ${name}! I'm dad.`;
        }
        webhook.send(output)
        .then(()=>{
            webhook.delete();
        })
        .catch((error)=>{
            console.log("error sending message with Dad webhook:", error);
            webhook.delete();
        })
    })
    .catch((error)=>{
        console.log("error creating webhook:", error);
    })
}

async function sixNineComm(msg) {
    msg.channel.send("Nice");
}

async function spoilerComm(msg) {
    var fileURL = msg.attachments.first().url;
    await msg.delete();
    msg.channel.send({files:[{attachment: fileURL, name: "SPOILER_IMAGE.png", spoiler: true}]});
}

client.login(BOT_TOKEN);