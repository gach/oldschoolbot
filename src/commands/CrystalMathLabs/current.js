const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

const { cmlErrorCheck } = require('../../util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the current records.',
			usage:
				'<overall|attack|defence|strength|hitpoints|ranged|prayer|magic|' +
				'cooking|woodcutting|fletching|fishing|firemaking|crafting|smithing|' +
				'mining|herblore|agility|thieving|slayer|farming|runecrafting|hunter|' +
				'construction|ehp> <day|week|month> [count:int{1,20}]',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS'],
			enabled: false
		});
	}

	async run(msg, [skill, timePeriod, count = 10]) {
		let body = await fetch(
			`https://crystalmathlabs.com/tracker/api.php?type=currenttop&timeperiod=${timePeriod}&skill=${skill}`
		)
			.then(res => res.text())
			.then(async res => cmlErrorCheck(res) || res);

		const top = [];
		body = body.split('\n');
		body.pop();

		for (let i = 0; i < body.length; i++) {
			const info = body[i].split(',');
			top.push({
				username: info[0],
				gained: parseFloat(info[1])
			});
		}

		const usernames = [];
		const gains = [];

		for (let i = 0; i < count; i++) {
			usernames.push(top[i].username);
			gains.push(top[i].gained.toLocaleString());
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setAuthor('Current Top')
			.setFooter(`CrystalMathLabs / ${count} Players / ${skill} / ${timePeriod}`)
			.addField('Name', usernames.join('\n'), true)
			.addField(`Gained ${skill} XP`, gains.join('\n'), true);
		return msg.send({ embed });
	}
};
