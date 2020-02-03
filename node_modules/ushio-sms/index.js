

var sms = (url) => {

	var o = {
		send: (to, msg0, msg1) => send(to, msg0, msg1)
	};


	const request = require('request');

	var send = (to, msg0, msg1) => {
		return new Promise((resolve, reject) => {
			request(url + `?to=${to}&s0=${msg0}&s1=${msg1}&t=${Date.parse(new Date())/1000}`, (err, res, body) => {
				resolve(body);
			});
		});
	};

	return o;
}


exports.sms = sms;

