import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import BankImageTask from '../../tasks/bankImage';
import { stringMatches, removeBankFromBank } from '../../lib/util';
import { bankHasAllItemsFromBank } from '../../lib/util/bankHasAllItemsFromBank';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Time } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[name:string]',
			cooldown: 3
		});
	}

	async run(msg: KlasaMessage, [name = '']: [string]) {
		const bankImages = (this.client.tasks.get('bankImage') as BankImageTask).backgroundImages;
		const selectedImage = bankImages.find(img => stringMatches(img.name, name));

		if (!selectedImage) {
			return msg.send(
				`The following bank images exist: ${bankImages.map(img => img.name).join(', ')}`
			);
		}

		if (!selectedImage.available) {
			throw `This image is not currently available.`;
		}

		if (msg.author.settings.get(UserSettings.BankBackground) === selectedImage.id) {
			throw `This is already your bank background.`;
		}

		// Check they have required collection log items.
		if (
			selectedImage.collectionLogItemsNeeded &&
			!bankHasAllItemsFromBank(
				msg.author.collectionLog,
				selectedImage.collectionLogItemsNeeded
			)
		) {
			throw `You're not worthy to use this background. You need these items in your Collection Log: ${await createReadableItemListFromBank(
				this.client,
				selectedImage.collectionLogItemsNeeded
			)}`;
		}

		// Check they have the required perk tier.
		if (
			selectedImage.perkTierNeeded &&
			getUsersPerkTier(msg.author) < selectedImage.perkTierNeeded
		) {
			throw `This background is only available for Tier ${Number(
				selectedImage.perkTierNeeded
			) - 1} patrons.`;
		}

		/**
		 * If this bank image has a gp or item cost, confirm and charge.
		 */
		if (selectedImage.gpCost || selectedImage.itemCost) {
			await msg.author.settings.sync(true);
			const userBank = msg.author.settings.get(UserSettings.Bank);

			// Ensure they have the required items.
			if (
				selectedImage.itemCost &&
				!bankHasAllItemsFromBank(userBank, selectedImage.itemCost)
			) {
				throw `You don't have the required items to purchase this background. You need: ${await createReadableItemListFromBank(
					this.client,
					selectedImage.itemCost
				)}.`;
			}

			// Ensure they have the required GP.
			if (
				selectedImage.gpCost &&
				msg.author.settings.get(UserSettings.GP) < selectedImage.gpCost
			) {
				throw `You need ${selectedImage.gpCost.toLocaleString()} GP to purchase this background.`;
			}

			// Start building a string to show to the user.
			let str = `${msg.author}, say \`confirm\` to confirm that you want to buy the **${selectedImage.name}** bank background for: `;

			// If theres an item cost or GP cost, add it to the string to show users the cost.
			if (selectedImage.itemCost) {
				str += await createReadableItemListFromBank(this.client, selectedImage.itemCost);
				if (selectedImage.gpCost) {
					str += `, ${selectedImage.gpCost.toLocaleString()} GP.`;
				}
			} else if (selectedImage.gpCost) {
				str += `${selectedImage.gpCost.toLocaleString()} GP.`;
			}

			str += ` **Note:** You'll have to pay this cost again if you switch to another background and want this one again.`;

			const confirmMsg = await msg.channel.send(str);

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
				return confirmMsg.edit(`Cancelling purchase.`);
			}

			if (selectedImage.itemCost) {
				await msg.author.settings.update(
					UserSettings.Bank,
					removeBankFromBank(userBank, selectedImage.itemCost)
				);
			}

			if (selectedImage.gpCost) {
				await msg.author.removeGP(selectedImage.gpCost);
			}
		}

		await msg.author.settings.update(UserSettings.BankBackground, selectedImage.id);

		return msg.send(`Your bank background is now **${selectedImage.name}**!`);
	}
}
