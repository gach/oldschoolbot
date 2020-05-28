import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	removeItemFromBank
} from '../../lib/util';
import { SkillsEnum } from '../../lib/skilling/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import bankHasItem from '../../lib/util/bankHasItem';
import Fletching from '../../lib/skilling/skills/fletching/fletching';
import { requiresMinion, minionNotBusy } from '../../lib/minions/decorators';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, fletchName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Fletching.Fletchables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available fletching items.txt`
			);
		}

		if (typeof quantity === 'string') {
			fletchName = quantity;
			quantity = null;
		}

		const fletchableItem = Fletching.Fletchables.find(item =>
			stringMatches(item.name, fletchName)
		);

		if (!fletchableItem) {
			throw `That is not a valid fletchable item, to see the items available do \`${msg.cmdPrefix}fletch --items\``;
		}
		let sets = 'x';
		if (fletchableItem.outputMultiple) {
			sets = 'sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Fletching) < fletchableItem.level) {
			throw `${msg.author.minionName} needs ${fletchableItem.level} Fletching to fletch ${fletchableItem.name}.`;
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const requiredItems: [string, number][] = Object.entries(fletchableItem.inputItems);

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = fletchableItem.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (fletchableItem.tickRate < 1) {
			timeToFletchSingleItem = fletchableItem.tickRate * Time.Second * 0.6;
		}

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToFletchSingleItem);
			for (const [itemID, qty] of requiredItems) {
				const itemsOwned = userBank[parseInt(itemID)];
				if (itemsOwned < qty) {
					throw `You dont have enough ${itemNameFromID(parseInt(itemID))}.`;
				}
				quantity = Math.min(quantity, Math.floor(itemsOwned / qty));
			}
		}

		const duration = quantity * timeToFletchSingleItem;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				fletchableItem.name
			}s you can fletch is ${Math.floor(msg.author.maxTripLength / timeToFletchSingleItem)}.`;
		}

		// Check the user has the required items to fletch.
		for (const [itemID, qty] of requiredItems) {
			const id = parseInt(itemID);
			if (!bankHasItem(userBank, id, qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(id)}.`;
			}
		}

		const data: FletchingActivityTaskOptions = {
			fletchableID: fletchableItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fletching,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// Remove the required items from their bank.
		let newBank = { ...userBank };
		for (const [itemID, qty] of requiredItems) {
			newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
		}
		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		msg.author.incrementMinionDailyDuration(duration);
		return msg.send(
			`${msg.author.minionName} is now Fletching ${quantity} ${sets} ${
				fletchableItem.name
			}s, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
