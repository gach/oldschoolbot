const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 0,
			description: 'Set your RuneScape Username, used for other commands.',
			usage: '[rsn:str{1,12}]'
		});
	}

	async run(msg, [newRSN]) {
		const RSN = msg.author.settings.get('RSN');
		if (!newRSN && RSN) {
			return msg.send(`Your current RSN is: \`${msg.author.settings.get('RSN')}\``);
		}

		if (!newRSN && !RSN) {
			return msg.send(`You don't have an RSN set. You can set one like this: ` +
			`\`${msg.guild.settings.get('prefix')}setrsn <username>\``);
		}

		newRSN = newRSN.toLowerCase();
		if (!newRSN.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$')) {
			throw 'Invalid username';
		}

		if (RSN === newRSN) {
			throw `Your RSN is already set to \`${RSN}\``;
		}

		if (RSN !== null) {
			await msg.author.settings.update('RSN', newRSN);
			return msg.send(`Changed your RSN from \`${RSN}\` to \`${newRSN}\``);
		}

		await msg.author.settings.update('RSN', newRSN);
		return msg.send(`Your RSN has been set to: \`${newRSN}\`.`);
	}

};
