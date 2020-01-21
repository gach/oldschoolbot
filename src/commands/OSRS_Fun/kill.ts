import { KlasaUser, KlasaMessage, Command, KlasaClient, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { toTitleCase } from '../../lib/util';

export default class extends Command {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			cooldown: 1,
			description: 'Simulate killing bosses (shows only rare drops).',
			usage: '<quantity:int{1}> <BossName:...str>',
			usageDelim: ' ',
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	determineKillLimit(user: KlasaUser) {
		if (user.id === this.client.owner?.id) {
			return Infinity;
		}

		if (user.settings.get('badges').length > 0) {
			return 1_000_000;
		}

		return 10_000;
	}


	async run(msg: KlasaMessage, [quantity, bossName]: [number, string]) {
		const result: ItemBank = await this.client.killWorkerThread.queue(async (fn: any) => {
			return fn.kill({quantity, bossName, limit: this.determineKillLimit(msg.author)});
		});

		if (typeof result === 'string') {
			return msg.send(result);
		}

		const image = await this.client.tasks
			.get('bankImage')
			.generateBankImage(
				result,
				`Loot from ${quantity.toLocaleString()} ${toTitleCase(bossName)}`,
				true,
				msg.flagArgs
			);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
