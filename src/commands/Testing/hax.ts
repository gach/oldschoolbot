import { CommandStore, KlasaMessage } from 'klasa';

import { Eatables } from '../../lib/data/eatables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		const paths = Object.values(Skills).map(sk => `skills.${sk.id}`);

		msg.author.settings.update(paths.map(path => [path, 14_000_000]));
		msg.author.settings.update(UserSettings.GP, 1_000_000_000);
		msg.author.settings.update(UserSettings.QP, 250);
		const loot: Record<string, number> = Object.fromEntries(
			Eatables.map(({ id }) => [id, 1000])
		);
		msg.author.addItemsToBank(loot);
		return msg.send(`Gave you 99 in all skills, 1b GP, 250 QP, and 1k of all eatable foods`);
	}
}
