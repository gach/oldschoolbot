import { Extendable, SettingsFolder, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import itemID from '../lib/util/itemID';
import { GearSetupTypes, UserFullGearSetup } from '../lib/gear/types';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import itemInSlot from '../lib/gear/functions/itemInSlot';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public rawGear(this: User) {
		const gear = (this.settings.get('gear') as SettingsFolder).toJSON() as UserFullGearSetup;

		return gear;
	}

	public hasItemEquippedAnywhere(this: User, itemID: number) {
		const gear = this.rawGear();
		for (const setup of Object.values(gear)) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === itemID);
			if (thisItemEquipped) return true;
		}

		return false;
	}

	public hasItemEquippedOrInBank(this: User, item: number | string) {
		const id = typeof item === 'string' ? itemID(item) : item;
		return this.hasItemEquippedAnywhere(id) || this.numItemsInBankSync(id) > 0;
	}

	public equippedWeapon(this: User, setup: GearSetupTypes) {
		const gear = this.rawGear()[setup];

		const [normalWeapon] = itemInSlot(gear, EquipmentSlot.Weapon);
		const [twoHandedWeapon] = itemInSlot(gear, EquipmentSlot.TwoHanded);
		return normalWeapon === null ? twoHandedWeapon : normalWeapon;
	}
}
