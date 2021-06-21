const BOT_INFO = require("./CONFIG.json");

const consoleUrl = new URL("http://localhost");
consoleUrl.hostname = BOT_INFO.MC_SERVER_HOSTNAME;
consoleUrl.port = BOT_INFO.MC_CONSOLE_PORT;

const socket = require("socket.io-client")(consoleUrl.toString());

async function main(client) {
    if (BOT_INFO.CONSOLE_ENABLED) {
        const console_channel = await client.channels.fetch(BOT_INFO.MC_CONSOLE_CHANNEL_ID);

        await socket.on("connect", async ()=> {
            await console_channel.send("Socket connected");
        });
    
        await socket.on("disconnect", async ()=> {
            await console_channel.send("Socket disconnected");

        });
    
        await socket.on("console", async (content)=>{
            await console_channel.send(content);
        });
    }

    if (BOT_INFO.MC_CHAT_ENABLED) {
        const chat_channel = await client.channels.fetch(BOT_INFO.MC_CHAT_CHANNEL);

        await socket.on("console", async (data)=>{
            chatMatch = data.match(/INFO\]\:\s*\<(.+)\>\s*(.+)/i);
            if (chatMatch) {
                const chatmsg = `[Minecraft Server] **${chatMatch[1]}**: ${chatMatch[2]}`;
                await chat_channel.send(chatmsg);
            }
        });
    }
}

module.exports = main;