async function spoiler(msg) {
    var fileURL = msg.attachments.first().url;
    var fileName = msg.attachments.first().name;
    await msg.delete();

    const tempmessage = await msg.channel.send("**Processing image...**");
    await msg.channel.send({content: `Here's your image, ${msg.author}:`, files:[{attachment: fileURL, name: `SPOILER_${fileName}`}]});
    tempmessage.delete();
}

module.exports = {command: spoiler}