module.exports = {
	recv : {
		Old_Protocol : {
			C : 1,
			CC : 1
		},
		Informations : {
			C : 28,
			Handshake : 1
		}
	},
	send : {
		Handshake : [ 26, 3 ]
	}
}