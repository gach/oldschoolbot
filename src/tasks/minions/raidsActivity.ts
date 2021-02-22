import { Task } from 'klasa';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { getRandomMysteryBox } from '../../lib/data/openables';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import {
	formatDuration,
	itemID,
	multiplyBank,
	noOp,
	queuedMessageSend,
	roll
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import filterBankFromArrayOfItems from '../../lib/util/filterBankFromArrayOfItems';

const uniques = [
	21034,
	21079,
	20997,
	21003,
	21043,
	21012,
	21018,
	21021,
	21024,
	13652,
	22386,
	20851,
	21000,
	21015,
	22388,
	22390,
	22392,
	22394,
	22396
];

export default class extends Task {
	async run({ channelID, team, challengeMode, duration }: RaidsActivityTaskOptions) {
		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		let totalPoints = 0;
		for (const member of team) {
			totalPoints += member.personalPoints;
		}

		let resultMessage = `The Raid has finished in a time of ${formatDuration(
			duration
		)} The total amount of points is ${totalPoints}. Here is the loot:`;
		for (let [userID, userLoot] of Object.entries(loot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			const purple = Object.keys(filterBankFromArrayOfItems(uniques, userLoot)).length > 0;
			if (!user) continue;
			const personalPoints = team.find(u => u.id === user.id)?.personalPoints;
			user.incrementMinigameScore('Raids', 1);
			if (roll(10)) {
				userLoot = multiplyBank(userLoot, 2);
				userLoot[getRandomMysteryBox()] = 1;
			} else if (user.usingPet('Flappy')) {
				userLoot = multiplyBank(userLoot, 2);
			}
			if (roll(2000)) {
				userLoot[23931] = 1;
			}
			if (roll(4500)) {
				userLoot[itemID('Takon')] = 1;
			}
			if (roll(140)) {
				userLoot[itemID('Clue scroll grandmaster')] = 1;
			}

			resultMessage += `\n**${user}** received: ${
				purple ? '🟪' : ''
			} ||${await createReadableItemListFromBank(
				this.client,
				userLoot
			)}||, personal points: ${personalPoints}, ${
				Math.round((personalPoints! / totalPoints) * 10000) / 100
			}% ${
				user.usingPet('Flappy')
					? `<:flappy:812280578195456002> Flappy helps ${user.username}, granting them 2x loot.`
					: ''
			}`;
			await user.addItemsToBank(userLoot, true);
		}

		queuedMessageSend(this.client, channelID, resultMessage);
	}
}