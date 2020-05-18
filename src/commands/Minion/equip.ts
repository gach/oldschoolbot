import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { GearTypes } from '../../lib/gear';
import readableGearTypeName from '../../lib/gear/functions/readableGearTypeName';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc> [quantity:integer{1}] [itemName:...string]',
			usageDelim: ' '
		});
	}

	async run(
		msg: KlasaMessage,
		[gearType, quantity = 1, itemName = '']: [GearTypes.GearSetupTypes, number, string]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			throw `${msg.author.minionName} is currently out on a trip, so you can't change their gear!`;
		}

		if (msg.flagArgs.name) {
			quantity = 1;
			itemName = msg.flagArgs.name;
		}
		const gearTypeSetting = resolveGearTypeSetting(gearType);

		const itemToEquip = getOSItem(itemName);
		if (!itemToEquip.equipable_by_player || !itemToEquip.equipment) {
			throw `This item isn't equippable.`;
		}

		const { slot } = itemToEquip.equipment;

		const currentEquippedGear = msg.author.settings.get(gearTypeSetting);

		/**
		 * Handle 2h items
		 */
		if (
			slot === EquipmentSlot.TwoHanded &&
			(currentEquippedGear[EquipmentSlot.Weapon] || currentEquippedGear[EquipmentSlot.Shield])
		) {
			throw `You can't equip this two-handed item because you have items equipped in your weapon/shield slots.`;
		}

		if (
			[EquipmentSlot.Weapon, EquipmentSlot.Shield, EquipmentSlot.TwoHanded].includes(slot) &&
			currentEquippedGear[EquipmentSlot.TwoHanded]
		) {
			throw `You can't equip this weapon or shield, because you have a 2H weapon equipped, and need to unequip it first.`;
		}

		const hasThisItem = await msg.author.hasItem(itemToEquip.id, quantity);
		if (!hasThisItem) {
			throw `You don't have this item, so you can't equip it.`;
		}

		/**
		 * If there's already an item equipped in this slot, unequip it,
		 * then recursively call this function again.
		 */
		const equippedInThisSlot = currentEquippedGear[slot];
		if (equippedInThisSlot) {
			const newGear = { ...currentEquippedGear };
			msg.author.log(
				`automatically unequipping ${itemNameFromID(
					newGear[slot]!.item
				)}, so they can equip ${itemName}`
			);
			newGear[slot] = null;

			await msg.author.addItemsToBank({
				[equippedInThisSlot.item]: equippedInThisSlot.quantity
			});
			await msg.author.settings.update(gearTypeSetting, newGear);

			return this.run(msg, [gearType, quantity, itemName]);
		}

		if (!itemToEquip.stackable && quantity > 1) {
			throw `You can't equip more than 1 of this item at once, as it isn't stackable!`;
		}

		await msg.author.removeItemFromBank(itemToEquip.id, quantity);
		const newGear = { ...currentEquippedGear };
		newGear[slot] = {
			item: itemToEquip.id,
			quantity
		};

		msg.author.log(`equipping ${quantity}x ${itemToEquip.name}[${itemToEquip.id}]`);

		await msg.author.settings.update(gearTypeSetting, newGear);

		return msg.send(
			`You equipped ${itemToEquip.name} in your ${readableGearTypeName(gearType)} setup.`
		);
	}
}
