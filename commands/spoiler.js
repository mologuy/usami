async function spoiler(msg) {
    var fileURL = msg.attachments.first().url;
    var fileName = msg.attachments.first().name;
    await msg.delete();

    const tempmessage = await msg.channel.send("**Processing image...**");

    const comment = msg.content.replace(/\|/g, '\\$&'); // Escaping spoiler tags
    
    var fileExt = fileName.match(/\.\w+$/i);
    if (fileExt) {
        fileExt = fileExt[0];
    }
    else {
        fileExt = "";
    }
    
    await msg.channel.send({content: `Here's your image, ${msg.author}!\n**${msg.author.username}'s comment:** || ${comment} ||`, files:[{attachment: fileURL, name: `SPOILER_filename${fileExt}`}]});
    tempmessage.delete();
}

module.exports = {command: spoiler}