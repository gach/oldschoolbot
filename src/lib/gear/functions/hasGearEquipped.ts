import { objectValues } from 'e';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '..';
import { itemNameFromID } from '../../util';
import hasItemEquipped from './hasItemEquipped';

export type GearRequired = Partial<
	{
		[key in EquipmentSlot]: number[];
	}
>;

export function hasGearEquipped(setup: GearTypes.GearSetup, reqs: GearRequired): boolean {
	for (const items of objectValues(reqs)) {
		if (!items) continue;

		for (let i = 0; i < items.length; i++) {
			if (hasItemEquipped(items[i], setup)) {
				console.log(`Has ${itemNameFromID(items[i])} equipped.`);
				break;
			} else if (i === items.length - 1) {
				console.log(`NO ${itemNameFromID(items[i])} equipped.`);
				return false;
			}
		}
	}

	return true;
}
