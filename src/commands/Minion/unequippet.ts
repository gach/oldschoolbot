import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addItemToBank, itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage): Promise<KlasaMessage> {
		const equippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
		if (!equippedPet) throw `You don't have a pet equipped.`;

		await msg.author.settings.update([
			[UserSettings.Minion.EquippedPet, null],
			[
				UserSettings.Bank,
				addItemToBank(msg.author.settings.get(UserSettings.Bank), equippedPet)
			]
		]);

		msg.author.log(`unequipping ${itemNameFromID(equippedPet)}[${equippedPet}]`);

		return msg.send(
			`${msg.author.minionName} picks up their ${itemNameFromID(
				equippedPet
			)} pet and places it back in their bank.`
		);
	}
}
