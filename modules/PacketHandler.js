const { inspect } = require('util'),
	Utils = require('../utils/Utils.js'),
	ByteArray = require('./ByteArray.js'),
	Identifiers = require('./Identifiers.js');

module.exports = class PacketHandler {
	constructor(server) {
		this.server = server;
	}

	async parsePacket(client, C, CC, packet) {
		if (this.server.debug) {
			console.log(`[RECV] [${client.ipAddress}] (${C}, ${CC}) ${inspect(packet.bytes.toString())}`);
		}
		
	}

	async parseOldPacket(client, C, CC, values) {
		if (this.server.debug) {
			console.log(`[RECV] [OLD] [${client.ipAddress}] (${C}, ${CC}) ${inspect(packet.bytes.toString())}`);
		}
		
	}
}