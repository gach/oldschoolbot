import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			aliases: ['bal', 'gp'],
			description: 'Shows how much virtual GP you own.'
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const coins = msg.author.settings.get(UserSettings.GP);

		if (coins === 0) {
			throw `You have no GP yet ${Emoji.Sad} You can get some GP by using the ${msg.cmdPrefix}daily command.`;
		}

		return msg.channel.send(`${Emoji.MoneyBag} You have ${coins.toLocaleString()} GP!`);
	}
}
