const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');
const fetch = require('node-fetch');

const bg = fs.readFileSync('./resources/images/qa-background.png');
const canvas = createCanvas(900, 506);
const ctx = canvas.getContext('2d');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Get yourself a Fake Ely! +fakeely username kc',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	async run(msg) {
		const { url } = await msg.channel.fetchImage();

		const image = await fetch(url).then(result => result.buffer());

		const BG = new Image();
		BG.src = bg;

		const userImage = new Image();
		userImage.src = image;

		ctx.drawImage(userImage, -50, 84, 180, 107);
		ctx.drawImage(userImage, 144, 84, 180, 100);
		ctx.drawImage(userImage, 331, 85, 184, 102);
		ctx.drawImage(userImage, 520, 84, 180, 107);
		ctx.drawImage(userImage, 707, 84, 196, 108);

		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		return msg.send(new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10000)}.jpg`));
	}

};
