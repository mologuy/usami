const Tail = require("tail").Tail;
const io = require("socket.io")();
const file = require("./file.json").location;

const tail = new Tail(file, {useWatchFile: false});
//tail = new Tail("./log/latest.log", {useWatchFile: true, fsWatchOptions: {interval:500}});

tail.on("line", (data)=>{
    console.log(data);
    io.emit("console", data);
});

io.on('connection', (socket)=>{
	console.log("socket connected:",socket.id);
	socket.on("disconnecting",(reason)=>{
		console.log("socket disconnected:",socket.id);
	});
});


io.listen(3000);
