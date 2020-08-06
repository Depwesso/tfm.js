module.exports = class ByteArray {
	constructor(bytes) {
		this.bytes = Buffer.isBuffer(bytes) ? bytes : Array.isArray(bytes) ? Buffer.from(bytes) : typeof(bytes) === "string" ? Buffer.from(bytes, "utf8") : Buffer.alloc(0);
		this.position = 0;
	}

	get length() {
		return this.bytes.length;
	}

	get bytesAvailable() {
		return this.length - this.position;
	}

	writeBytes(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.isBuffer(value) ? value : Array.isArray(value) ? Buffer.from(value) : typeof(value) === "string" ? Buffer.from(value, "utf8") : Buffer.alloc(0)]);
		return this;
	}

	writeByte(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.alloc(1)]);
		this.bytes.writeInt8(value, this.bytes.length - 1);
		return this;
	}

	writeUnsignedByte(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.alloc(1)]);
		this.bytes.writeUInt8(value, this.bytes.length - 1);
		return this;
	}

	writeShort(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.alloc(2)]);
		this.bytes.writeInt16BE(value, this.bytes.length - 2);
		return this;
	}

	writeUnsignedShort(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.alloc(2)]);
		this.bytes.writeUInt16BE(value, this.bytes.length - 2);
		return this;
	}

	writeInt(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.alloc(4)]);
		this.bytes.writeInt32BE(value, this.bytes.length - 4);
		return this;
	}

	writeUnsignedInt(value) {
		this.bytes = Buffer.concat([this.bytes, Buffer.alloc(4)]);
		this.bytes.writeUInt32BE(value, this.bytes.length - 4);
		return this;
	}

	writeBoolean(value) {
		return this.writeByte(value ? 1 : 0);
	}

	writeUTF(value) {
		this.writeUnsignedShort(value.length);
		this.bytes = Buffer.concat([this.bytes, Buffer.from(value, "utf8")]);
		return this;
	}

	readBytes(length) {
		this.position += length;
		return this.bytes.subarray(this.position - length, this.position);
	}

	readByte() {
		return this.bytes.readInt8(this.position++);
	}

	readUnsignedByte() {
		return this.bytes.readUInt8(this.position++);
	}

	readShort() {
		const value = this.bytes.readInt16BE(this.position);
		this.position += 2;
		return value;
	}

	readUnsignedShort() {
		const value = this.bytes.readUInt16BE(this.position);
		this.position += 2;
		return value;
	}

	readInt() {
		const value = this.bytes.readInt32BE(this.position);
		this.position += 4;
		return value;
	}

	readUnsignedInt() {
		const value = this.bytes.readUInt32BE(this.position);
		this.position += 4;
		return value;
	}

	readBoolean() {
		return this.readByte() !== 0;
	}

	readUTF() {
		const size = this.readUnsignedShort();
		this.position += size;
		return this.bytes.subarray(this.position - size, this.position).toString();
	}
}