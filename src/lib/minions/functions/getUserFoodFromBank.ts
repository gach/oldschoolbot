import { addBanks } from 'oldschooljs/dist/util';
import { O } from 'ts-toolbelt';

import { Eatables } from '../../data/eatables';
import { ItemBank } from '../../types';

export default function getUserFoodFromBank(
	userBank: O.Readonly<ItemBank>,
	totalHealingNeeded: number
): false | ItemBank {
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove: ItemBank = {};
	// Gets all the eatables in the user bank
	for (const eatable of Eatables.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))) {
		const inBank = userBank[eatable.id];
		const toRemove = Math.ceil(totalHealingCalc / eatable.healAmount);
		if (!inBank) continue;
		if (inBank >= toRemove) {
			totalHealingCalc -= Math.ceil(eatable.healAmount * toRemove);
			foodToRemove = addBanks([foodToRemove, { [eatable.id]: toRemove }]);
			break;
		} else {
			totalHealingCalc -= Math.ceil(eatable.healAmount * inBank);
			foodToRemove = addBanks([foodToRemove, { [eatable.id]: inBank }]);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}
