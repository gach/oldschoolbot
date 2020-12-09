import { percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events, Time } from '../../lib/constants';
import {
	Pickpockable,
	Pickpocketables,
	Stalls
} from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Pickpockable,
	quantity: number,
	hasThievingCape: boolean
): [number, number, number, number] {
	let xpReceived = 0;

	let successful = 0;
	let damageTaken = 0;
	// Pickpocketing takes 2 ticks
	const timeToPickpocket = (npc.customTickRate ?? 2.05) * 0.6;
	// For future Ardougne Diary and Thieving cape
	const diary = 1;
	const thievCape = hasThievingCape && npc.customTickRate === undefined ? 1.1 : 1;

	const chanceOfSuccess = (npc.slope * currentLevel + npc.intercept) * diary * thievCape;

	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			// The minion has just been stunned, and cant pickpocket for a few ticks, therefore
			// they also miss out on the next few pickpockets depending on stun time. And take damage
			damageTaken += npc.stunDamage;
			quantity -= Math.round(npc.stunTime / timeToPickpocket);
			continue;
		}
		successful++;

		xpReceived += npc.xp;
	}

	return [successful, damageTaken, xpReceived, chanceOfSuccess];
}

export default class extends Task {
	async run({
		monsterID,
		quantity,
		successfulQuantity,
		userID,
		channelID,
		duration,
		xpReceived
	}: PickpocketActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const npc = Pickpocketables.find(_npc => _npc.id === monsterID);
		const stall = Stalls.find(_stall => _stall.id === monsterID);

		if (!npc && !stall) {
			this.client.wtf(new Error(`Missing pickpocket npc/stall with ID ${monsterID}.`));
			return;
		}
		const currentLevel = user.skillLevel(SkillsEnum.Thieving);

		const loot = new Bank();

		if (npc) {
			for (let i = 0; i < successfulQuantity; i++) {
				loot.add(npc.table.roll());
			}
		}

		// Keeps different amount of loot depending on stall.
		if (stall) {
			for (let i = 0; i < (successfulQuantity * stall.lootPercent) / 100; i++) {
				loot.add(stall.table.roll());
			}
		}

		await user.addItemsToBank(loot.values(), true);
		await user.addXP(SkillsEnum.Thieving, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Thieving);

		const xpHr = `${((xpReceived / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr`;

		let str = `${user}, ${user.minionName} finished pickpocketing/stealing from ${
			npc ? npc.name : stall?.name
		} ${successfulQuantity}x times, due to failures you missed out on ${
			quantity - successfulQuantity
		}x pickpockets/steals, you also received ${xpReceived.toLocaleString()} XP (${xpHr}).`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Thieving level is now ${newLevel}!`;
		}
		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			loot.values()
		)}.`;

		if (loot.amount('Rocky') > 0) {
			str += `\n\n**You have a funny feeling you're being followed...**`;
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received a **Rocky** <:Rocky:324127378647285771> while pickpocketing/stealing from ${
					npc ? npc.name : stall?.name
				}, their Thieving level is ${currentLevel}!`
			);
		}

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(
				`continued trip of pickpocketing/stealing ${quantity}x ${
					npc ? npc.name : stall?.name
				}[${npc ? npc.id : stall?.id}]`
			);
			return this.client.commands
				.get('pickpocket')!
				.run(res, [quantity, npc ? npc.name : stall?.name]);
		});
	}
}
