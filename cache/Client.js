module.exports = class Client {
	constructor(server, socket) {
		this.server = server;
		this.socket = socket;

		this.ipAddress = socket.remoteAddress;

		this.authKey = 0;
		this.packetID = 0;
		this.length = 0;

		this.buffer = Buffer.alloc(0);

		this.validatedVersion = false;
	}
}