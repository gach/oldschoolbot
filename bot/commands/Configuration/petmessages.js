const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			subcommands: true,
			description: 'Enables/disables Pet Messages, which rolls a chance at a pet on every message in a channel.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('petchannel')) throw `Pet Messages are already enabled.`;
		await msg.guild.settings.update('petchannel', msg.channel, msg.guild);
		return msg.send(`Enabled Pet Messages in this server.`);
	}

	async disable(msg) {
		if (msg.guild.settings.get('petchannel') === null) throw "Pet Messages aren't enabled, so you can't disable them.";
		await msg.guild.settings.reset('petchannel');
		return msg.send(`Disabled Pet Messages in this channel.`);
	}

};
