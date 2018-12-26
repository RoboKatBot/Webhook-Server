let RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();
const https = require('https');
const {exec} = require('child_process');

feeder.add({
	url: 'https://xkcd.com/rss.xml',
	refresh: 2000
});

feeder.add({
	url:"http://feeds.feedburner.com/Explosm",
	refresh:2000
});

feeder.on('new-item',(item)=>{
	if (item.date < Date.now()-86400000) return;
	send({content:item.link});
});



function send(payload) {
	https.request({
		host:"discordapp.com",
		path:"/api/webhooks/367102978403991554/Lk6DN4QksDhe4oUxOd0TWH-AYJGt7ZrUcSpgHzmQlgc57CgugSBuNts0qmFoCy1Cj2sz",
		method:"POST",
		headers:{
			"Content-Type":"multipart/form-data"
		}
	}).end(JSON.stringify(payload));
}



///////////////////////////////////////////////////////////////////////////////////


const fs = require('fs');
const pfx = require('fs').readFileSync('./mycert.pfx');
const server = https.createServer({pfx});
server.on('request',(req,res)=>{
	let body = '';
	req.on('data', chunk => {
		body += chunk.toString(); // convert Buffer to string
	});
	req.on('end', () => {
		const rep = JSON.parse(body).repository;
		switch(rep.name) {
			case 'Discord-Selfbot':
				exec(`cd /home/pi/bin/selfbot && git pull ${rep.clone_url} master`);
				break;
			case 'Webhook-Server':
				exec(`cd /home/pi/bin/Webhook-Server && git pull ${rep.clone_url} master`);
				break;
			default:
				console.error(`${rep.name} not recogonized`);
		}
		console.log(`${rep.name} updated`);
		res.end('ok');
	});
})
server.listen(5555);