import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { FaladorDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Crafting from '../../lib/skilling/skills/crafting';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { updateBankSetting, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['tan'],
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to craft items, or tan leather.',
			examples: ['+craft green dhide body', '+craft leather']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, craftName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Crafting.Craftables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				'Available crafting items.txt'
			);
		}

		if (typeof quantity === 'string') {
			craftName = quantity;
			quantity = null;
		}

		const craftable = Crafting.Craftables.find(item => stringMatches(item.name, craftName));

		if (!craftable) {
			return msg.send(
				`That is not a valid craftable item, to see the items available do \`${msg.cmdPrefix}craft --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Crafting) < craftable.level) {
			return msg.send(`${msg.author.minionName} needs ${craftable.level} Crafting to craft ${craftable.name}.`);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		// Get the base time to craft the item then add on quarter of a second per item to account for banking/etc.
		let timeToCraftSingleItem = craftable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		const [hasFallyHard] = await userhasDiaryTier(msg.author, FaladorDiary.hard);
		if (craftable.bankChest && (hasFallyHard || msg.author.skillLevel(SkillsEnum.Crafting) >= 99)) {
			timeToCraftSingleItem /= 3.25;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Crafting);

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToCraftSingleItem);
			const max = userBank.fits(craftable.inputItems);
			if (max < quantity && max !== 0) quantity = max;
		}

		const duration = quantity * timeToCraftSingleItem;
		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${craftable.name}s you can craft is ${Math.floor(
					maxTripLength / timeToCraftSingleItem
				)}.`
			);
		}

		const itemsNeeded = craftable.inputItems.clone().multiply(quantity);
		let gpNeeded = 0;
		const currentGP = msg.author.settings.get(UserSettings.GP);
		if (itemsNeeded.has('Coins')) {
			gpNeeded = itemsNeeded.amount('Coins');
			itemsNeeded.remove('Coins');
		}

		// Check the user has all the required items to craft.
		if (!userBank.has(itemsNeeded.bank)) {
			return msg.send(
				`You don't have enough items. For ${quantity}x ${craftable.name}, you're missing **${itemsNeeded
					.clone()
					.remove(userBank)}**.`
			);
		}

		// Check the user has the GP to craft.
		if (gpNeeded > currentGP) {
			return msg.send(
				`You don't have enough GP. For ${quantity}x ${craftable.name}, you're missing **${
					gpNeeded - currentGP
				}**.`
			);
		}

		await msg.author.removeItemsFromBank(itemsNeeded);

		if (gpNeeded > 0) await msg.author.removeGP(gpNeeded);

		updateBankSetting(this.client, ClientSettings.EconomyStats.CraftingCost, itemsNeeded.bank)

		await addSubTaskToActivityTask<CraftingActivityTaskOptions>({
			craftableID: craftable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Crafting
		});

		let gpUsedString = '';

		if (gpNeeded > 0) {
			gpUsedString += ` and ${gpNeeded} GP`;
		}

		return msg.send(
			`${msg.author.minionName} is now crafting ${quantity}x ${
				craftable.name
			}, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${itemsNeeded}${gpUsedString} from your bank.`
		);
	}
}
