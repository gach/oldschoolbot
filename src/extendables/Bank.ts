import { Extendable, SettingsFolder, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { UserSettings } from '../lib/settings/types/UserSettings';
import { GearTypes } from '../lib/gear';
import { ItemBank } from '../lib/types';
import { addItemToBank } from '../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public numOfItemsOwned(this: User, itemID: number) {
		const bank = this.settings.get(UserSettings.Bank);

		let numOwned = 0;

		if (typeof bank[itemID] !== 'undefined') {
			numOwned += bank[itemID];
		}

		const gear = (this.settings.get('gear') as SettingsFolder).toJSON() as {
			[key: string]: GearTypes.GearSetup;
		};

		for (const setup of Object.values(gear)) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === itemID);
			if (thisItemEquipped) numOwned += thisItemEquipped.quantity;
		}

		return numOwned;
	}

	public numItemsInBankSync(this: User, itemID: number) {
		const bank = this.settings.get(UserSettings.Bank);

		const result = bank[itemID];

		if (typeof result !== 'undefined') {
			return result;
		}

		return 0;
	}

	public numItemsInToolbeltSync(this: User, itemID: number) {
		const toolbelt = this.settings.get(UserSettings.Toolbelt);

		const result = toolbelt[itemID];

		if (typeof result !== 'undefined') {
			return result;
		}

		return 0;
	}

	public allItemsOwned(this: User): ItemBank {
		let totalBank = { ...this.settings.get(UserSettings.Bank) };

		for (const setup of Object.values(this.rawGear())) {
			for (const equipped of Object.values(setup)) {
				if (equipped?.item) {
					totalBank = addItemToBank(totalBank, equipped.item, equipped.quantity);
				}
			}
		}

		const equippedPet = this.settings.get(UserSettings.Minion.EquippedPet);
		if (equippedPet) {
			totalBank = addItemToBank(totalBank, equippedPet, 1);
		}

		return totalBank;
	}
}
