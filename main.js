const { createServer } = require('net'),
	fs = require('fs'),
	ByteArray = require('./modules/ByteArray.js'),
	PacketHandler = require('./modules/PacketHandler.js'),
	Identifiers = require('./modules/Identifiers.js'),
	Client = require('./cache/Client.js');

class Server {
	constructor() {
		this.packetHandler = new PacketHandler(this);

		this.version = 583;
		this.cKey = 'WDGWoNozNFAX';

		this.players = {}

		this.debug = true;
	}

	get playerCount() {
		return Object.keys(this.players).length;
	}

	startServer() {
		const self = this,
			ports = [11801, 12801, 13801, 14801];
		for (let port of ports) {
			createServer((socket) => {
				const client = new Client(self, socket);
				socket.on('data', async (data) => {
					try {
						await self.data_received(client, data);
					} catch (err) {
						console.log('An error occurred! Details in \'errors.log\'');
						fs.appendFileSync('errors.log', [`IP: ${client.ipAddress}`, `Time: ${new Date().toLocaleString()}`, err.stack].join('\n'));
						client.socket.destroy();
					}
				});
				socket.on('end', async () => {
					await self.socket_end(client);
				})
			}).listen(port, '0.0.0.0');
		}
		console.log(`Server running on ports [ ${ports.join(', ')} ]`);
	}

	async socket_end(client) {
		
	}

	async data_received(client, data) {
		if (data.toString() == '<policy-file-request/>\x00') {
			client.socket.write('<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>\x00');
			client.socket.destroy();
		} else if (client.isClosed || data.length < 2) {
			console.log(`[${client.ipAddress}] Sent an unacceptable data!`);
			client.socket.destroy();
		} else {
			client.buffer = Buffer.concat([client.buffer, data]);
			while (client.buffer.length > client.length) {
				if (client.length === 0) {
					for (let i = 0; i < 5; i++) {
						let byte = client.buffer.slice(0, 1)[0];
						client.buffer = client.buffer.slice(1);
						client.length |= (byte & 127) << (i * 7);

						if (!(byte & 0x80)) {
							client.length++;
							break;
						}
					}
				}
				if (client.buffer.length >= client.length) {
					await this.parsePacket(client, new ByteArray(client.buffer.slice(0, client.length)));
					client.buffer = client.buffer.slice(client.length);
					client.length = 0;
				}
			}
		}
	}

	async parsePacket(client, packet) {
		const packetID = packet.readByte(),
			C = packet.readUnsignedByte(),
			CC = packet.readUnsignedByte();
		if (client.validatedVersion) {
			if (packetID !== client.packetID) {
				console.log(`[${client.ipAddress}] Unsynchronized packet communication`);
				client.socket.destroy();
				return;
			}
			client.packetID = (client.packetID + 1) % 100;
			if (C === Identifiers.recv.Old_Protocol.C && CC === Identifiers.recv.Old_Protocol.C) {
				const values = packet.readUTF().split('\x01');
				await this.packetHandler.parseOldPacket(client, values[0].charCodeAt(0), values[0].charCodeAt(1), values.slice(1));
			} else {
				await this.packetHandler.parsePacket(client, C, CC, packet);
			}
		} else if (C === Identifiers.recv.Informations.C && CC === Identifiers.recv.Informations.Handshake) {
			const version = packet.readShort(),
				cKey = packet.readUTF();
			if (version !== this.version || cKey !== this.cKey) {
				console.log(`[${client.ipAddress}] Invalid version or cKey (${version}, ${cKey})`);
				client.socket.destroy();
			} else {
				client.packetID = (packetID + 1) % 100;
				await this.sendHandshake(client);
			}
		} else {
			console.log(`[${client.ipAddress}] Tried to send a packet before handshake!`);
			client.socket.destroy();
		}
	}

	async sendHandshake(client) {
		client.validatedVersion = true;
		await this.sendPacket(client, new ByteArray(Identifiers.send.Handshake).writeUnsignedInt(this.playerCount)
							.writeUTF('').writeUTF('')
							.writeUnsignedInt(Math.floor(Math.random() * 4294967295)).writeBoolean(false));
	}

	async sendPacket(client, packet) {
		const p = new ByteArray();
		let loc1 = packet.length,
			loc2 = loc1 >>> 7;

		while (loc2 !== 0) {
			p.writeUnsignedByte(loc1 & 127 | 128);
			loc1 = loc2;
			loc2 >>>= 7;
		}
		p.writeUnsignedByte(loc1 & 127).writeBytes(packet.bytes);
		client.socket.write(p.bytes);
	}
}
new Server().startServer();