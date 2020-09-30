import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';
import { addBanks, removeItemFromBank } from 'oldschooljs/dist/util';

import { GearTypes } from '../../gear';
import { GearSetup, GearStat } from '../../gear/types';
import { ItemBank } from '../../types';
import { removeBankFromBank } from '../../util';
import getOSItem from '../../util/getOSItem';

function getItemScore(item: Item) {
	return (
		item?.equipment![GearStat.DefenceCrush] +
		item?.equipment![GearStat.DefenceSlash] +
		item?.equipment![GearStat.DefenceStab] +
		item?.equipment![GearStat.DefenceMagic] +
		item?.equipment![GearStat.DefenceRanged] +
		item?.equipment![GearStat.AttackCrush] +
		item?.equipment![GearStat.AttackSlash] +
		item?.equipment![GearStat.AttackStab] +
		item?.equipment![GearStat.AttackMagic] +
		item?.equipment![GearStat.AttackRanged]
	);
}

export default function(
	userBank: ItemBank,
	userGear: GearSetup,
	gearType: GearTypes.GearSetupTypes,
	type: string,
	style: string,
	extra: string | null = null
) {
	let toRemoveFromGear: ItemBank = {};
	let toRemoveFromBank: ItemBank = {};
	const gearToEquip = { ...userGear };

	let score2h = 0;
	let score2hExtra = 0;
	let scoreWs = 0;
	let scoreWsExtra = 0;

	// Get primary stat to sort by
	const gearStat: GearStat = `${type}_${style}` as GearStat;
	let gearStatExtra: GearStat | null = null;

	// Get extra settings (prayer or strength)
	switch (extra) {
		case 'strength':
			switch (gearType) {
				case 'melee':
					gearStatExtra = GearStat.MeleeStrength;
					break;
				case 'range':
					gearStatExtra = GearStat.RangedStrength;
					break;
				case 'mage':
					gearStatExtra = GearStat.MagicDamage;
					break;
			}
			break;
		case 'prayer':
			gearStatExtra = GearStat.Prayer;
			break;
	}

	// Init equipables
	const equipables: Record<EquipmentSlot, number[]> = {
		'2h': [],
		ammo: [],
		body: [],
		cape: [],
		feet: [],
		hands: [],
		head: [],
		legs: [],
		neck: [],
		ring: [],
		shield: [],
		weapon: []
	};

	// Read current equipped user gear, removes it and add to bank
	for (const [slot, item] of Object.entries(userGear)) {
		if (item) {
			toRemoveFromGear = addBanks([toRemoveFromGear, { [item.item]: item.quantity }]);
		}
		gearToEquip[slot as EquipmentSlot] = null;
	}

	// Get all items by slot from user bank
	for (const item of Object.keys(addBanks([userBank, toRemoveFromGear]))) {
		const osItem = getOSItem(item);
		if (osItem.equipable_by_player && osItem.equipment && osItem.equipment[gearStat] >= 0) {
			equipables[osItem.equipment.slot].push(osItem.id);
		}
	}

	// Sort all slots
	for (const [slot, items] of Object.entries(equipables)) {
		if (equipables[slot as EquipmentSlot][0]) {
			// Sort by the extra gear first if that is set
			equipables[slot as EquipmentSlot] = items.sort((a, b) => {
				const itemA = getOSItem(a);
				const itemB = getOSItem(b);
				const aGearScore = getItemScore(itemA);
				const bGearScore = getItemScore(itemB);
				if (gearStatExtra) {
					return (
						itemB?.equipment![gearStatExtra] - itemA?.equipment![gearStatExtra] ||
						itemB?.equipment![gearStat] - itemA?.equipment![gearStat] ||
						bGearScore - aGearScore
					);
				}
				return (
					itemB?.equipment![gearStat] - itemA?.equipment![gearStat] ||
					bGearScore - aGearScore
				);
			});

			// Get the best item (first in slot) and if that exists, add its stats to the calculation
			const item = getOSItem(equipables[slot as EquipmentSlot][0]);
			gearToEquip[slot as EquipmentSlot] = { item: item.id, quantity: 1 };
			score2h += slot !== 'weapon' && slot !== 'shield' ? item.equipment![gearStat] : 0;
			scoreWs += slot !== '2h' ? item.equipment![gearStat] : 0;
			if (gearStatExtra) {
				score2hExtra +=
					slot !== 'weapon' && slot !== 'shield' ? item.equipment![gearStatExtra] : 0;
				scoreWsExtra += slot !== '2h' ? item.equipment![gearStatExtra] : 0;
			}
			toRemoveFromBank = addBanks([toRemoveFromBank, { [item.id]: 1 }]);
		}
	}

	// Removes weapon/shield or 2h, depending on what has the highest stats
	if ((!gearStatExtra && scoreWs > score2h) || (gearStatExtra && scoreWsExtra > score2hExtra)) {
		if (gearToEquip['2h']) {
			toRemoveFromBank = removeItemFromBank(
				toRemoveFromBank,
				gearToEquip['2h']!.item,
				gearToEquip['2h']!.quantity
			);
			gearToEquip['2h'] = null;
		}
	} else {
		if (gearToEquip.weapon) {
			toRemoveFromBank = removeItemFromBank(
				toRemoveFromBank,
				gearToEquip.weapon!.item,
				gearToEquip.weapon!.quantity
			);
			gearToEquip.weapon = null;
		}
		if (gearToEquip.shield) {
			toRemoveFromBank = removeItemFromBank(
				toRemoveFromBank,
				gearToEquip.shield!.item,
				gearToEquip.shield!.quantity
			);
			gearToEquip.shield = null;
		}
	}

	// Remove items that are already equipped from being added to bank and re-equipped
	for (const item of Object.keys(toRemoveFromGear)) {
		if (toRemoveFromBank[Number(item)]) {
			delete toRemoveFromGear[Number(item)];
			delete toRemoveFromBank[Number(item)];
		}
	}

	return {
		toRemoveFromGear,
		toRemoveFromBank,
		gearToEquip,
		userFinalBank: removeBankFromBank(addBanks([userBank, toRemoveFromGear]), toRemoveFromBank)
	};
}
