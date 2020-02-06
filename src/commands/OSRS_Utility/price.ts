import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { Items, Util } from 'oldschooljs';
import { MessageEmbed } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Looks up the price of an item using the OSBuddy API.',
			usage: '<name:str>'
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		const item = Items.get(name);
		if (!item) return msg.send(`Couldn't find that item.`);

		const priceOfItem = await this.client.fetchItemPrice(item.id);

		const embed = new MessageEmbed()
			.setTitle(item.name)
			.setColor(52224)
			.setThumbnail(
				`https://raw.githubusercontent.com/runelite/static.runelite.net/gh-pages/cache/item/icon/${item.id}.png`
			)
			.setDescription(`${priceOfItem.toLocaleString()} (${Util.toKMB(priceOfItem)})`);

		return msg.send({ embed });
	}
}
