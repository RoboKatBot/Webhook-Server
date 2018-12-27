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

app.get('/', (req, res) => {
	let VERIFY_TOKEN = "This Is A Webhook Lmao"
	// Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	if (mode && token) {
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
			res.end('fail');
		}
	}
});

app.post('/webhook', (req, res) => {
	let body = req.body;
	// Checks this is an event from a page subscription
	if (body.object === 'page') {
		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function(entry) {
			// Gets the message. entry.messaging is an array, but 
			// will only ever contain one message, so we get index 0
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
});



app.all('*', (req, res) => {
	console.log(req.url);

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