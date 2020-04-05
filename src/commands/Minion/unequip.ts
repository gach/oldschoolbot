import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { GearTypes } from '../../lib/gear';
import readableGearTypeName from '../../lib/gear/functions/readableGearTypeName';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range> <itemName:...string>',
			usageDelim: ' '
		});
	}

	async run(
		msg: KlasaMessage,
		[gearType, itemName]: [GearTypes.GearSetupTypes, string]
	): Promise<KlasaMessage> {
		const gearTypeSetting = resolveGearTypeSetting(gearType);

		const itemToEquip = getOSItem(itemName);
		if (!itemToEquip.equipable_by_player || !itemToEquip.equipment) {
			throw `This item isn't equippable.`;
		}

		const { slot } = itemToEquip.equipment;
		const currentEquippedGear = msg.author.settings.get(gearTypeSetting);

		const equippedInThisSlot = currentEquippedGear[slot];
		if (!equippedInThisSlot) throw `You have nothing equipped in this slot.`;
		if (equippedInThisSlot.item !== itemToEquip.id) {
			throw `You don't have a ${itemToEquip.name} equipped.`;
		}
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		await msg.author.addItemsToBank({
			[equippedInThisSlot.item]: equippedInThisSlot.quantity
		});
		await msg.author.settings.update(gearTypeSetting, newGear);

		return msg.send(
			`You unequipped ${itemToEquip.name} from your ${readableGearTypeName(gearType)} setup.`
		);
	}
}
