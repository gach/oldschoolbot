import { CommandStore, KlasaMessage, ArrayActions } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:item]',
			aliases: ['fav']
		});
	}

	async run(msg: KlasaMessage, [items]: [Item[] | undefined]) {
		const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);

		if (!items) {
			const currentFavorites = msg.author.settings.get(UserSettings.FavoriteItems);
			if (currentFavorites.length === 0) {
				return msg.send(`You have no favorited items.`);
			}
			return msg.send(
				`Your current favorite items are: ${currentFavorites
					.map(id => itemNameFromID(id))
					.join(', ')}.`
			);
		}

		const [item] = items;

		if (currentFavorites.includes(item.id)) {
			await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
				arrayAction: ArrayActions.Remove
			});
			return msg.send(`Removed ${item.name} from your favorite items.`);
		}

		await msg.author.settings.update(UserSettings.FavoriteItems, item.id, {
			arrayAction: ArrayActions.Add
		});

		return msg.send(`Added ${item.name} from your favorite items.`);
	}
}
