import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import {
	stringMatches,
	removeBankFromBank,
	multiplyBank,
	bankHasAllItemsFromBank,
	addBanks
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Createables from '../../lib/createables';
import { SkillsEnum } from '../../lib/skilling/types';
import Ornaments from '../../lib/ornaments';
import { cleanString } from 'oldschooljs/dist/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1}] <itemName:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		itemName = itemName.toLowerCase();

		// if is ornament, run ornaments.ts
		if (
			Ornaments.find(ornamentItem => {
				if (
					ornamentItem.ornatedItemAliases &&
					ornamentItem.ornatedItemAliases.some(ornamentAlias =>
						stringMatches(ornamentAlias, cleanString(itemName))
					)
				) {
					return ornamentItem;
				}
			})
		) {
			const _result = this.client.commands
				.get('ornament')
				?.run(msg, [msg.flagArgs.remove ? 'remove' : 'create', quantity, itemName]);
			if (_result) return _result;
		}

		const createableItem = Createables.find(item => stringMatches(item.name, itemName));
		if (!createableItem) throw `That's not a valid item you can create.`;

		if (typeof quantity !== 'number' || createableItem.cantHaveItems) {
			quantity = 1;
		}

		if (
			createableItem.QPRequired &&
			msg.author.settings.get(UserSettings.QP) < createableItem.QPRequired
		) {
			throw `You need ${createableItem.QPRequired} QP to create this item.`;
		}

		if (
			createableItem.smithingLevel &&
			msg.author.skillLevel(SkillsEnum.Smithing) < createableItem.smithingLevel
		) {
			// Ensure they have the required skills to create the item.
			throw `You need ${createableItem.smithingLevel} smithing to create this item.`;
		}

		if (
			createableItem.firemakingLevel &&
			msg.author.skillLevel(SkillsEnum.Firemaking) < createableItem.firemakingLevel
		) {
			throw `You need ${createableItem.firemakingLevel} firemaking to create this item.`;
		}

		if (
			createableItem.craftingLevel &&
			msg.author.skillLevel(SkillsEnum.Crafting) < createableItem.craftingLevel
		) {
			throw `You need ${createableItem.craftingLevel} crafting to create this item.`;
		}

		if (
			createableItem.prayerLevel &&
			msg.author.skillLevel(SkillsEnum.Prayer) < createableItem.prayerLevel
		) {
			throw `You need ${createableItem.prayerLevel} prayer to create this item.`;
		}

		if (
			createableItem.agilityLevel &&
			msg.author.skillLevel(SkillsEnum.Agility) < createableItem.agilityLevel
		) {
			throw `You need ${createableItem.agilityLevel} agility to create this item.`;
		}

		const outItems = multiplyBank(createableItem.outputItems, quantity);
		const inItems = multiplyBank(createableItem.inputItems, quantity);

		const outputItemsString = await createReadableItemListFromBank(this.client, outItems);

		const inputItemsString = await createReadableItemListFromBank(this.client, inItems);

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Ensure they have the required items to create the item.
		if (!bankHasAllItemsFromBank(userBank, inItems)) {
			throw `You don't have the required items to create this item. You need: ${inputItemsString}.`;
		}

		// Check for any items they cant have 2 of.
		if (createableItem.cantHaveItems) {
			const cantHaveItemsString = await createReadableItemListFromBank(
				this.client,
				createableItem.cantHaveItems
			);

			for (const [itemID, qty] of Object.entries(createableItem.cantHaveItems)) {
				const numOwned = msg.author.numOfItemsOwned(parseInt(itemID));
				if (numOwned >= qty) {
					throw `You can't create this item, because you have ${cantHaveItemsString} in your bank.`;
				}
			}
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to create **${outputItemsString}** using ${inputItemsString}.`
			);

			// Confirm the user wants to create the item(s)
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling item creation.`);
			}
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([outItems, removeBankFromBank(userBank, inItems)])
		);

		if (!createableItem.noCl) msg.author.addItemsToCollectionLog(outItems);

		return msg.send(`You created ${outputItemsString}.`);
	}
}
