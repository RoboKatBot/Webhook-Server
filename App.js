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


const fs = require('fs');
const pfx = require('fs').readFileSync('./mycert.pfx');
const server = https.createServer({ pfx });
server.on('request', (req, res) => {
	console.log(req.url);
	if (req.url === '/webhook') { //facebook webhook handler
		if (req.method == 'GET') {
			let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

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

			return;
		}



		let body = '';
		req.on('data', chunk => {
			body += chunk.toString(); // convert Buffer to string
		});
		req.on('end', () => {
			body = JSON.parse(body);
		});

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
			res.end('fail');
		}

		return;
	}
	let body = '';
	req.on('data', chunk => {
		body += chunk.toString(); // convert Buffer to string
	});
	req.on('end', () => {
		const rep = JSON.parse(body).repository;
		switch (rep.name) {
			case 'Discord-Selfbot':
				exec(`cd /home/pi/bin/Discord-Selfbot && git pull ${rep.clone_url} master`);
				break;
			case 'Webhook-Server':
				exec(`cd /home/pi/bin/Webhook-Server && git pull ${rep.clone_url} master`);
				break;
			case 'Website':
				exec(`cd /home/pi/bin/Website && git pull ${rep.clone_url} master`);
				break;
			default:
				console.error(`${rep.name} not recogonized`);
		}
		console.log(`${rep.name} updated`);
		res.end('ok');
	});
})
server.listen(5555);