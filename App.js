let RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();
const https = require('https');
const { exec } = require('child_process');

feeder.add({
	url: 'https://xkcd.com/rss.xml',
	refresh: 2000
});

feeder.add({
	url: "http://feeds.feedburner.com/Explosm",
	refresh: 2000
});

feeder.on('new-item', (item) => {
	if (item.date < Date.now() - 86400000) return;
	send({ content: item.link });
});


function send(payload) {
	https.request({
		host: "discordapp.com",
		path: "/api/webhooks/367102978403991554/Lk6DN4QksDhe4oUxOd0TWH-AYJGt7ZrUcSpgHzmQlgc57CgugSBuNts0qmFoCy1Cj2sz",
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data"
		}
	}).end(JSON.stringify(payload));
}



///////////////////////////////////////////////////////////////////////////////////

const pfx = require('fs').readFileSync('../Website/2d64ba1c-49f6-4a79-9cfa-ddd0e300c5fd.pfx');
var app = require('express')().use(require('body-parser').json());


app.post('/', (req, res) => {
	let body = req.body;
	switch (body.repository.name) {
		case 'Discord-Selfbot':
			exec(`cd /home/pi/bin/Discord-Selfbot && git pull ${body.repository.clone_url} master`);
			break;
		case 'Webhook-Server':
			exec(`cd /home/pi/bin/Webhook-Server && git pull ${body.repository.clone_url} master`);
			break;
		case 'Website':
			exec(`cd /home/pi/bin/Website && git pull ${body.repository.clone_url} master`);
			break;
		default:
			console.error(`${body.repository.name} not recogonized`);
	}
	console.log(`${body.repository.name} updated`);
	res.end('ok');
});


const server = https.createServer({ pfx }, app);
server.listen(5555);