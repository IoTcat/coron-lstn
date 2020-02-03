const sms = require('./index.js').sms('https://api.yimian.xyz/sms/');

(async () => {
	console.log(await sms.send('18118155257', 'test', 'send'));
})();