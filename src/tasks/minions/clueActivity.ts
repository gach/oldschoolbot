import { Task } from 'klasa';

import clueTiers from '../../lib/minions/data/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { Events } from '../../lib/constants';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { roll, multiplyBank, addItemToBank, itemID, rand, addBanks } from '../../lib/util';
import { getRandomMysteryBox } from '../../lib/openables';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

const possibleFound = new LootTable()
	.add('Reward casket (beginner)')
	.add('Reward casket (beginner)')
	.add('Reward casket (beginner)')
	.add('Reward casket (easy)')
	.add('Reward casket (easy)')
	.add('Reward casket (easy)')
	.add('Reward casket (medium)')
	.add('Reward casket (medium)')
	.add('Reward casket (hard)')
	.add('Reward casket (elite)')
	.add('Reward casket (master)')
	.add('Tradeable Mystery Box')
	.add('Tradeable Mystery Box')
	.add('Untradeable Mystery Box');

export default class extends Task {
	async run({ clueID, userID, channelID, quantity, duration }: ClueActivityTaskOptions) {
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${
			clueTier.name
		} clues. ${user.minionName} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`+open ${clueTier.name}\``;

		let loot = { [clueTier.id]: quantity };
		if (roll(10)) {
			loot = multiplyBank(loot, 2);
			loot[getRandomMysteryBox()] = 1;
		}
		if (user.equippedPet() === itemID('Zippy')) {
			let bonusLoot = {};
			for (let i = 0; i < rand(1, 4); i++) {
				const { item } = possibleFound.roll()[0];
				bonusLoot = addItemToBank(bonusLoot, item);
			}
			loot = addBanks([loot, bonusLoot]);
			str += `\n\nZippy has found these items for you: ${await createReadableItemListFromBank(
				this.client,
				bonusLoot
			)}`;
		}
		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
		});
	}
}
