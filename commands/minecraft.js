const util = require('minecraft-server-util');
const Discord = require("discord.js");
const BOT_INFO = require("../CONFIG.json");

async function handler(msg, args) {
    argsMatch = args.match(/^\s*(\b\S+\b)(.*)/);
    if (argsMatch) {
        switch(argsMatch[1]) {
            case "join":
                join(msg, argsMatch[2]);
                break;
            case "rcon":
                rcon(msg, argsMatch[2], false);
                break;
            default:
                status(msg);
                break;
        }
    }
    else {
        status(msg);
    }
}

async function rcon(msg, args, silent = false) {
    if (msg.member.roles.cache.some(role => role.name == BOT_INFO.MC_MOD_ROLE_NAME)) {
        var argsMatch = args.match(/^\s*(\b\S+\b)\s*(.*)/)
        if (argsMatch) {
            const rconClient = new util.RCON(BOT_INFO.MC_SERVER_HOSTNAME, {port: BOT_INFO.RCON_PORT, enableSRV: true, timeout: 5000, password: BOT_INFO.RCON_PASSWORD});
            rconClient.on('output', (message) => {
                console.log(message);
                if (!silent)
                    msg.channel.send(`Server Response:\`\`\`\n${message} \`\`\``);
                rconClient.close();
            });
            await rconClient.connect();
            var mcCommand = `${argsMatch[1]} ${argsMatch[2]}`;
            rconClient.run(mcCommand);
        }
    }
    else {
        await msg.reply(`You need the role "${BOT_INFO.MC_MOD_ROLE_NAME}" to use this command`);
    }
}

async function status(msg) {
    const response = await util.status(BOT_INFO.MC_SERVER_HOSTNAME, {port: BOT_INFO.MC_SERVER_PORT});
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
            value: response.version,
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

    await msg.channel.send(msgEmbed);
}

async function join(msg, args, silent = false){
    argsMatch = args.match(/^\s*(\b\S+\b)(.*)/);
    if (argsMatch) {
        var mcCommand = `whitelist add ${argsMatch[1]}`;
        await rcon(msg, mcCommand, false);
    }
    else {
        await msg.channel.send("Command usage: `minecraft join <minecraft username>`");
    }
}

module.exports = {
    command:    handler,
    rcon:       {command: rcon},
    status:     {command: status},
    join:       {command: join}
}