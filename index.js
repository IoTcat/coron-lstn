var get = (o_params)=>{
	var o = {
		province: null,
		city: null,
		tel: ['18118155257'],
		success: ()=>{},
		error: ()=>{},
		url: 'https://lab.isaaclin.cn/nCoV/api/area',
		interval: 5000,
		debug: false
	}

	Object.assign(o, o_params);

	const request = require('request');
	const sms = require('ushio-sms').sms('https://api.yimian.xyz/sms/');

	const getInfo = ()=>{
		return new Promise((resolve, reject) => request(o.url + ((o.province)?`?province=${encodeURI(o.province)}`:``), (err, res, body) => {
			if(err) reject(err);
			var pro = (JSON.parse(body)).results[0];//console.log(pro);
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
		}));
	};

	const unit = async () => {
		var info = await getInfo();
		console.log(info)

		if(!o.debug){
			setTimeout(unit, o.interval);
		}
	}

	unit();

	return o;
}

module.exports = get;