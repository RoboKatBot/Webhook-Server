const RssFeedEmitter = require('rss-feed-emitter');
const feeder = new RssFeedEmitter();
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const app = require('express')().use(require('body-parser').json());
const git = require('nodegit');
const config = require('config.json')


feeder.add({
	url: 'https://xkcd.com/rss.xml',
	refresh: 2000
});
feeder.add({
	url: 'http://createfeed.wprssaggregator.com/extract.php?url=https%3A%2F%2Farchiveofourown.org%2Fworks%2F11478249%2Fnavigate&in_id_or_class=&url_contains=11478249&order=reverse',
	refresh: 2000
});

feeder.add({
	url: "http://feeds.feedburner.com/Explosm",
	refresh: 2000
});

feeder.add({
	url: "http://dresdencodak.com/feed/",
	refresh: 2000
});

feeder.on('new-item', (item) => {
	send({ content: item.link });
});


function send(payload) {
	https.request({
		host: "discordapp.com",
		path: config.webhookURL,
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data"
		}
	}).end(JSON.stringify(payload));
}



//////////////////////////////////////////////////////////////////////////////////



app.post('/', (req, res) => {
	let body = req.body;
	if (!body) return;

	/*if(fs.existsSync(`/home/pi/bin/${body.repository.name}`)) {
		git.Repository.open(`/home/pi/bin/${body.repository.name}`).then(repo=>{
			git.Stash.apply(repo,0)
				.then(_=>repo.fetchAll())
				.then(_=>repo.mergeBranches("master","origin/master"))
				.catch(console.error);
		}).catch(console.error);
	}*/


	switch (body.repository.name) {
		case 'Discord-Selfbot':
			exec(`cd /home/pi/bin/Discord-Selfbot && git fetch --all && git reset --hard origin/master`);
			break;
		case 'Webhook-Server':
			exec(`cd /home/pi/bin/Webhook-Server && git fetch --all && git reset --hard origin/master`);
			break;
		case 'Website':
			exec(`cd /home/pi/bin/Website && git fetch --all && git reset --hard origin/master`);
			break;
		default:
			console.error(`${body.repository.name} not recogonized`);
	}
	console.log(`${body.repository.name} updated`);
	res.end('ok');
});

const options = {
	cert: fs.readFileSync('/etc/letsencrypt/live/lkao.science/fullchain.pem'),
	key: fs.readFileSync('/etc/letsencrypt/live/lkao.science/privkey.pem')
};

const server = https.createServer(options, app);
server.listen(5555);


//on startup 
exec(`cd /home/pi/bin/Discord-Selfbot && git fetch --all && git reset --hard origin/master`);
exec(`cd /home/pi/bin/Webhook-Server && git fetch --all && git reset --hard origin/master`);
exec(`cd /home/pi/bin/Website && git fetch --all && git reset --hard origin/master`);
exec('git stash drop');
