import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import Skills from '../../lib/skilling/skills';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Eatables } from '../../lib/eatables';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}

		const paths = Skills.map(sk => `skills.${sk.id}`);

		msg.author.settings.update(paths.map(path => [path, 14_000_000]));
		msg.author.settings.update(UserSettings.GP, 1_000_000_000);
		msg.author.settings.update(UserSettings.QP, 250);
		const loot = {};
		for (const item of Eatables) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			loot[item.id] = 1000;
		}
		msg.author.addItemsToBank(loot);
		return msg.send(`Gave you 99 in all skills, 1b GP, 250 QP, and 1k of all eatable foods`);
	}
}
