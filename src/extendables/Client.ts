import { Extendable, ExtendableStore, KlasaClient, SQLProvider } from 'klasa';
import { Client } from 'discord.js';
import fetch from 'node-fetch';
import { Util } from 'oldschooljs';

import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { Time, Events } from '../lib/constants';
import getOSItem from '../lib/util/getOSItem';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Client] });
	}

	async fetchItemPrice(this: KlasaClient, itemID: number | string) {
		if (!this.production) {
			return 73;
		}

		if (typeof itemID === 'string') itemID = parseInt(itemID);

		if (itemID === 995) {
			return 1;
		}

		const currentItems = this.settings!.get(ClientSettings.Prices);

		const currentItem = currentItems[itemID];

		const osItem = getOSItem(itemID);
		const needsToFetchAgain = osItem.tradeable_on_ge && currentItem.price === 0;

		if (
			!needsToFetchAgain &&
			currentItem &&
			Date.now() - currentItem.fetchedAt < Time.Day * 7
		) {
			return currentItem.price;
		}

		this.emit(Events.Log, `Fetching Price of item[${itemID}]`);
		const itemData = await fetch(
			`https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${itemID}`
		)
			.then(res => res.json())
			.then(item => item.item)
			.catch(() => null);

		let price = 0;

		const currentPrice = itemData?.current?.price;
		if (currentPrice) {
			price = typeof currentPrice === 'string' ? Util.fromKMB(currentPrice) : currentPrice;
		}

		const newItems = { ...currentItems };

		newItems[itemID] = {
			price,
			fetchedAt: Date.now() + Time.Hour * Math.floor(Math.random() * 100)
		};

		await this.settings!.update('prices', newItems);

		return price;
	}

	async query(this: KlasaClient, query: string) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		return (this.providers.default as SQLProvider).runAll(query);
	}
}
