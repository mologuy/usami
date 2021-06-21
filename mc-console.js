const BOT_INFO = require("./CONFIG.json");

const consoleUrl = new URL("http://localhost");
consoleUrl.hostname = BOT_INFO.MC_SERVER_HOSTNAME;
consoleUrl.port = BOT_INFO.MC_CONSOLE_PORT;

const socket = require("socket.io-client")(consoleUrl.toString());

async function main(client) {
    if (BOT_INFO.CONSOLE_ENABLED) {
        const console_channel = await client.channels.fetch(BOT_INFO.MC_CONSOLE_CHANNEL_ID);

        await socket.on("connect", async ()=> {
            try {
                await console_channel.send("Socket connected");
            }
            catch (e) {
                throw e;
            }
        });
    
        await socket.on("disconnect", async ()=> {
            try {
                await console_channel.send("Socket disconnected");
            }
            catch (e) {
                throw e;
            }
        });
    
        await socket.on("console", async (content)=>{
            try {
                await console_channel.send(content);
            }
            catch (e) {
                throw e;
            }
        });
    }

    if (BOT_INFO.MC_CHAT_ENABLED) {
        const chat_channel = await client.channels.fetch(BOT_INFO.MC_CONSOLE_CHANNEL_ID);

        await socket.on("console", async (data)=>{
            try {
                chatMatch = data.match(/INFO\]\:\s*\<(.+)\>\s*(.+)/i);
                if (chatMatch) {
                    const chatmsg = `[Minecraft Server] **${chatMatch[1]}**: ${chatMatch[2]}`;
                    console.log("sending chat:", chatmsg);
                    await chat_channel.send(chatmsg);
                }
                else {
                    console.log("data didn't match chat message:", data);
                }
            }
            catch (e) {
                throw e;
            }
        });
    }
}

module.exports = main;