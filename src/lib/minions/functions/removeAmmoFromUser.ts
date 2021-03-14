import { KlasaClient, KlasaUser } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { addBanks, bankHasItem, itemID } from 'oldschooljs/dist/util';

import { roll } from '../../../lib/util';
import { itemInSlot } from '../../gear';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types/index';
import { itemNameFromID } from '../../util';
import createReadableItemListFromBank from '../../util/createReadableItemListFromTuple';
import getOSItem from '../../util/getOSItem';
import { GearSetupTypes } from './../../gear/types';

export default async function removeAmmoFromUser(
	client: KlasaClient,
	user: KlasaUser,
	hits: number
): Promise<string> {
	await user.settings.sync(true);
	const rangeWeapon = user.equippedWeapon(GearSetupTypes.Range);
	if (!rangeWeapon) throw `No weapon is equipped in range.`;
	const gear = user.rawGear()[GearSetupTypes.Range];
	const [cape] = itemInSlot(gear, EquipmentSlot.Cape);
	let [ammo] = itemInSlot(gear, EquipmentSlot.Ammo);
	let blowpipe = false;
	if (rangeWeapon.name.toLowerCase() === 'toxic blowpipe') {
		blowpipe = true;
		const defaultDart = user.settings.get(UserSettings.Minion.defaultDartToUse);
		const dart = getOSItem(defaultDart);
		ammo = dart;
		if (!ammo) throw `No default dart have been choosen.`;
	}
	if (!ammo) throw `No ammo is equipped in range.`;
	if (rangeWeapon.name.includes('dart')) {
		ammo = rangeWeapon;
	} else if (blowpipe) {
		if (!user.settings.get(UserSettings.Minion.defaultDartToUse).includes('dart')) {
			throw `The ammunition type used by toxic blowpipe is darts and scales. Default a dart type with the command combatsetup.`;
		}
	} else if (rangeWeapon.name.includes('cross')) {
		if (!ammo.name.includes('bolt')) {
			throw `The ammunition type used by crossbows is bolts. Equip a bolt in the range setup.`;
		}
	} else if (rangeWeapon.name.includes('ballista')) {
		if (!ammo.name.includes('javelin')) {
			throw `The ammunition type used by ballistas is javelins. Equip a javelin in the range setup.`;
		}
	} else if (!ammo.name.includes('arrow')) {
		throw `The ammunition type used by bows is arrows. Equip a arrow in the range setup.`;
	}
	let brokenAmmo = 0;
	let dropOnFloor = 1;
	// Make ava's and other capes affect dropOnFloor chance. 1 = 100 % currently.
	if (cape) {
		if (cape.name.includes('attractor')) {
			dropOnFloor = 5;
		} else if (cape.name.includes('accumulator')) {
			dropOnFloor = 12;
		} else if (cape.name.includes('assembler')) {
			dropOnFloor = 999999;
		}
	}

	for (let i = 0; i < hits; i++) {
		if (roll(5)) {
			brokenAmmo++;
			continue;
		}
		if (roll(dropOnFloor)) {
			if (roll(4)) {
				brokenAmmo++;
				continue;
			}
		}
	}
	if (rangeWeapon.name.includes('ballista')) brokenAmmo = hits;

	const userBank = user.settings.get(UserSettings.Bank);
	let ammoToRemove: ItemBank = {};
	if (!bankHasItem(userBank, ammo.id, brokenAmmo)) {
		throw `You don't have enough ${itemNameFromID(ammo.id)} in the bank.`;
	}
	if (blowpipe) {
		if (!bankHasItem(userBank, itemID("Zulrah's scales"), Math.floor(brokenAmmo * 3.3))) {
			throw `You don't have enough Zulrah's scales in the bank.`;
		}
		ammoToRemove = addBanks([
			ammoToRemove,
			{ [itemID("Zulrah's scales")]: Math.floor(brokenAmmo * 3.3) }
		]);
		await user.removeItemFromBank(itemID("Zulrah's scales"), Math.floor(brokenAmmo * 3.3));
	}
	// Remove the required items from their bank.
	ammoToRemove = addBanks([ammoToRemove, { [ammo.id]: brokenAmmo }]);
	await user.removeItemFromBank(ammo.id, brokenAmmo);

	return `${await createReadableItemListFromBank(client, ammoToRemove)} from ${user.username}`;
}
