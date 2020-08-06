module.exports = class Utils {
	static getRandom(size) {
		let result = '',
			chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		for (let i = 0; i < size; i++)
			result += chars[Math.floor(Math.random() * (chars.length - 1))];
		return result;
	}
}