var get = (o_params)=>{
	var o = {
		province: null,
		city: null,
		sms: [],
		mail: [],
		success: ()=>{},
		error: ()=>{},
		url: 'https://api.yimian.xyz/coro',
		interval: 50000,
		debug: false
	}

	Object.assign(o, o_params);

	const request = require('request');
	const os = require('os');
	const fs = require('fs');
	const sms = require('ushio-sms')('https://api.yimian.xyz/sms/');
	const mail = require('ushio-mail')('https://api.yimian.xyz/mail/');
    const uk = require(__dirname + '/node_modules/coro-py/uk.js');

	const fileBck = /*os.tmpdir() + ((os.platform() == 'win32')?'\\':'/') +  */__dirname + `/var/${o.province+o.city}.tmp`;
	var updateTime = 0;
	fs.access(fileBck ,function(err){
	    if(err && err.code == "ENOENT"){
	    	updateTime = 0;
	    }else{
	    	updateTime = fs.readFileSync(fileBck, 'utf8');
	    }
	    unit();
	})


	const getInfo = ()=>{
		return new Promise(async (resolve, reject) => {
			var pro = await uk();//cons
			pro.updateTime = (new Date()).valueOf();
			if(!o.city){
				resolve(pro);
				//console.log(pro.confirmedCount);
			}else{
				pro.cities.forEach(item=>{
					if(item.cityName == o.city){
						var pro_t = item;
						pro_t['updateTime'] = pro.updateTime;
						resolve(pro_t);
					}
				})
			}
		});
	};

	const unit = async () => {
		var info = {};
        info.confirmedCount = await getInfo();
		if(o.debug)console.log(info);

		if(info.confirmedCount > updateTime){
			updateTime = info.confirmedCount;
			fs.writeFileSync(fileBck, updateTime);
			await push(info);
		}

		if(!o.debug){
			setTimeout(unit, o.interval);
		}
	}


	const push = info => new Promise(async resolve => {
		console.log(info);
		await pushMail(info);
		setTimeout(pushSms, o.interval/2, info);
	});


	const pushMail = info => new Promise(async resolve => {
		for(var index = 0; index < o.mail.length; index++){
			await mail.send(
				o.mail[index],
				`冠状病毒 ${o.province} ${(o.city)?o.city:''} 确诊 ${info.confirmedCount}`, 
				`截至${new Date()}, ${o.province} ${(o.city)?o.city:''} <strong>已确诊${info.confirmedCount}人</strong>。
		
\n\r<br><br>

以上数据自动抓取自<a href="https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public#number-of-cases">uk gov</a>。正则: /negative[\\W\\s]*(\\d+)[\\s\\S]*positive/i
\n\r<br><br>

iotcat(https://iotcat.me)`,
				'iotcat-py'
				);
			console.log('send to ' + o.mail[index]);
		}
		resolve();
	});

	const pushSms = info => new Promise(async resolve => {
		for(var index = 0; index < o.sms.length; index++){
			await sms.send(
				o.sms[index],
				`${o.province}${(o.city)?o.city:''}确诊${info.confirmedCount}`,
				'提醒您'
				);
			console.log('send to ' + o.sms[index]);
		}
		resolve();
	});

	return o;
}

module.exports = get;
