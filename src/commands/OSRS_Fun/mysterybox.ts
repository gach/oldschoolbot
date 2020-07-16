import { KlasaUser, KlasaMessage, Command, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Openables } from 'oldschooljs';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { PerkTier } from '../../lib/constants';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
            cooldown: 1,
            aliases: ['mysterybox'],
			usage: '[quantity:int{1}]',
			usageDelim: ' '
		});
    }
    
    determineLimit(user: KlasaUser) {
		if (this.client.owners.has(user)) {
			return Infinity;
		}

		const perkTier = getUsersPerkTier(user);

		if (perkTier >= PerkTier.Four) {
			return 100_000;
		}

		if (perkTier === PerkTier.Three) {
			return 50_000;
		}

		if (perkTier === PerkTier.Two) {
			return 20_000;
		}

		if (perkTier === PerkTier.One) {
			return 1_000;
		}

		return 50;
	}

	async run(msg: KlasaMessage, [quantity = 1]: [number]) {
		const limit = this.determineLimit(msg.author);
		if (quantity > limit) {
			throw `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 50,000 by becoming a patron at <https://www.patreon.com/oldschoolbot>.*`;
        }

		let loot = Openables.MysteryBox.open(quantity);

		const opened = `You opened ${quantity} Mystery box${quantity > 1 ? 's' : ''}:`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot from ${quantity} Mystery box${quantity > 1 ? 's' : ''}:`
			);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}