import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import resolveItems from '../../lib/util/resolveItems';
import {
	bankHasAllItemsFromBank,
	formatDuration,
	removeBankFromBank,
	resolveNameBank,
	itemID
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { Activity, Tasks, Time } from '../../lib/constants';
import { rand } from '../../util';
import { minionNotBusy } from '../../lib/minions/decorators';

const options = {
	max: 1,
	time: 10_000,
	errors: ['time']
};

const unlimitedFireRuneProviders = resolveItems([
	'Staff of fire',
	'Fire battlestaff',
	'Mystic fire staff',
	'Lava battlestaff',
	'Mystic lava staff',
	'Steam battlestaff',
	'Mystic steam staff',
	'Smoke battlestaff',
	'Mystic smoke staff',
	'Tome of fire'
]);

const unalchables = [itemID('Nature rune'), itemID('Fire rune')];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}] <item:...item>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	@minionNotBusy
	async run(msg: KlasaMessage, [quantity = null, item]: [number | null, Item[]]) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = item.find(i => userBank[i.id] && i.highalch);
		if (!osItem) {
			throw `You don't have any of this item to alch.`;
		}

		if (unalchables.some(item => item === osItem.id)) {
			throw `This item cannot be alched.`;
		}

		// 5 tick action
		const timePerAlch = Time.Second * 3;

		const maxCasts = Math.min(
			Math.floor(msg.author.maxTripLength / timePerAlch),
			userBank[osItem.id]
		);

		if (!quantity) {
			quantity = maxCasts;
		}

		if (quantity * timePerAlch > msg.author.maxTripLength) {
			throw `The max number of alchs you can do is ${maxCasts}!`;
		}

		const duration = quantity * timePerAlch;
		let fireRuneCost = quantity * 5;

		for (const runeProvider of unlimitedFireRuneProviders) {
			if (msg.author.hasItemEquippedAnywhere(runeProvider)) {
				fireRuneCost = 0;
				break;
			}
		}

		const alchValue = quantity * osItem.highalch;

		const consumedItems = resolveNameBank({
			...(fireRuneCost > 0 ? { 'Fire rune': fireRuneCost } : {}),
			'Nature rune': quantity,
			[osItem.name]: quantity
		});

		const consumedItemsString = await createReadableItemListFromBank(
			this.client,
			consumedItems
		);

		if (!bankHasAllItemsFromBank(userBank, consumedItems)) {
			throw `You don't have the required items, you need ${consumedItemsString}`;
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const alchMessage = await msg.channel.send(
				`${msg.author}, say \`confirm\` to alch ${quantity} ${osItem.name} (${Util.toKMB(
					alchValue
				)}). This will take approximately ${formatDuration(
					duration
				)}, and consume ${quantity}x Nature runes.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return alchMessage.edit(`Cancelling alch of ${quantity}x ${osItem.name}.`);
			}
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			removeBankFromBank(userBank, consumedItems)
		);

		const data: AlchingActivityTaskOptions = {
			itemName: osItem.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			alchValue,
			type: Activity.Alching,
			id: rand(1, 1_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		msg.author.log(`alched Quantity[${quantity}] ItemID[${osItem.id}] for ${alchValue}`);

		const response = `${msg.author.minionName} is now alching ${quantity}x ${
			osItem.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
