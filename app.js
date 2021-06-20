const Discord = require("discord.js");

const help = require("./commands/help.js");
const rules = require("./commands/rules.js");
const minecraft = require("./commands/minecraft.js");
const dad = require("./commands/dad.js");
const spoiler = require("./commands/spoiler.js");

const BOT_INFO = require("./CONFIG.json");

const client = new Discord.Client();
const BOT_TOKEN = BOT_INFO.TOKEN;
const BOT_PREFIX = BOT_INFO.PREFIX;
const MC_URL = BOT_INFO.MC_SERVER_HOSTNAME;
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

client.on('message', async (msg) => {
    if (!msg.author.bot && !msg.webhookID) {
        try {
            var commMatch = msg.content.match(commRegex);
            if (msg.channel.id == BOT_INFO.MC_CONSOLE_CHANNEL_ID){
                await minecraft.rcon.command(msg,msg.content);
            }
            else if (CHAT_ENABLED && msg.channel.id == BOT_INFO.MC_CHAT_CHANNEL) {
                var tellraw_obj = [{text: "[", bold: true},{text: "Discord", bold: true, color: "light_purple"},{text: "] ", bold: true}, {text: `<${msg.author.username}> ${msg.content}`, bold: false}];
                var tellraw_msg = `tellraw @a ${JSON.stringify(tellraw_obj)}`;
                await minecraft.rcon.command(msg, tellraw_msg, true);
            }
            else if (commMatch) {
                console.log(`Command recieved: ${commMatch[1]}`);
                switch (commMatch[1]) {
                    case "ping":
                        await pingComm(msg);
                        break;
                    case "help":
                        await help.command(msg, commMatch[2]);
                        break;
                    case "rules":
                        await rules.command(msg);
                        break;
                    case "minecraft":
                        await minecraft.command(msg, commMatch[2]);
                        break;
                    case "whitelist":
                        await minecraft.join.command(msg, commMatch[2]);
                        break;
                    case "rcon":
                        //minecraftRconComm(msg, commMatch[2]);
                        await minecraft.rcon.command(msg, commMatch[2]);
                        break;
                    default:
                        await msg.channel.send(`Command not found: \`${commMatch[1]}\``);
                        break;
                }
            }
            else {
                var dadMatch = msg.content.match(/^(i\W*m|i\s+am)\s+(.*)/i);
                var sixNineMatch = msg.content.match(/.*69.*/i);
                var spoilerMatch = msg.content.match(/.*spoiler.*/i);
                if (dadMatch) {
                    await dad.command(msg,dadMatch[2]);
                }
                if (sixNineMatch) {
                    await sixNineComm(msg);
                }
                if (spoilerMatch && msg.attachments.size == 1) {
                    await spoiler.command(msg);
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }
});

async function pingComm(msg) {
    await msg.channel.send("pong");
}

async function sixNineComm(msg) {
    await msg.channel.send("Nice");
}

async function spoilerComm(msg) {
    var fileURL = msg.attachments.first().url;
    var fileName = msg.attachments.first().name;
    await msg.delete();
    msg.channel.send({files:[{attachment: fileURL, name: "SPOILER_" + fileName}]});
}

client.login(BOT_INFO.TOKEN);