const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['servers', 'communities', 'community'],
			description: 'Shows some community servers related to OSRS.',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setTitle('Community Servers')
			.setColor(14981973)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setDescription(servers);

		return msg.send({ embed });
	}

};

const servers = `
[Old School RuneScape](https://discord.gg/gbfNeqd)
Official Old School server

[IronScape](https://discord.gg/dpKvnbb)
Community for ironmen

[We Do Raids](https://discord.gg/gREZC7f)
Raiding community

[Skilling Methods](https://discord.gg/e2effBN)
Show/discuss different skill training methods

[Gear](https://discord.gg/7KZHZ38)
Show/discuss different gear setups for PVM

[RuneLite](https://discord.gg/SB8edn6)
Official RuneLite client server`;
