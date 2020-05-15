import { KlasaMessage, CommandStore } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import minionIcons from '../../lib/minions/data/minionIcons';
import { Events } from '../../lib/constants';
import getOSItemsArray from '../../lib/util/getOSItemsArray';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}] [itemname:...string]',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number | undefined, string]) {
		if (!itemName) {
			return msg.send(
				`Your current sacrificed amount is: ${msg.author.settings
					.get(UserSettings.SacrificedValue)
					.toLocaleString()}. You can see the icons you can unlock here: <https://www.oldschool.gg/oldschoolbot/minions?Minion%20Icons>`
			);
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItemsArray = getOSItemsArray(itemName);
		const osItem = osItemsArray.find(i => userBank[i.id] && itemIsTradeable(i.id));

		if (!osItem) {
			throw `You don't have any of this item to sacrifice, or it is not tradeable.`;
		}

		const numItemsHas = userBank[osItem.id];
		if (!quantity) {
			quantity = numItemsHas;
		}

		if (quantity > numItemsHas) {
			throw `You dont have ${quantity}x ${osItem.name}.`;
		}

		const priceOfItem = await this.client.fetchItemPrice(osItem.id);
		const totalPrice = priceOfItem * quantity;

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sacrifice ${quantity} ${
					osItem.name
				}, this will add ${totalPrice.toLocaleString()} (${Util.toKMB(
					totalPrice
				)}) to your sacrificed amount.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sacrifice of ${quantity}x ${osItem.name}.`);
			}
		}

		if (priceOfItem > 50_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just sacrificed ${quantity}x ${osItem.name}!`
			);
		}

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.removeItemFromBank(osItem.id, quantity);

		msg.author.log(`sacrificed Quantity[${quantity}] ItemID[${osItem.id}] for ${totalPrice}`);

		let str = '';
		const currentIcon = msg.author.settings.get(UserSettings.Minion.Icon);
		for (const icon of minionIcons) {
			if (newValue < icon.valueRequired) continue;
			if (newValue >= icon.valueRequired) {
				if (currentIcon === icon.emoji) break;
				await msg.author.settings.update(UserSettings.Minion.Icon, icon.emoji);
				str += `\n\nYou have now unlocked the **${icon.name}** minion icon!`;
				this.client.emit(
					Events.ServerNotification,
					`**${msg.author.username}** just unlocked the ${icon.emoji} icon for their minion.`
				);
				break;
			}
		}

		return msg.send(
			`You sacrificed ${quantity}x ${
				osItem.name
			}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
