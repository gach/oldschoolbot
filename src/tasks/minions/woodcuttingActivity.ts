import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, rand } from '../../lib/util';
import { Time, Emoji, Events } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Woodcutting from '../../lib/skills/woodcutting';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';

const WoodcuttingPet = itemID('Beaver');

export default class extends Task {
	async run({ logID, quantity, userID, channelID }: WoodcuttingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Woodcutting);

		const Log = Woodcutting.Logs.find(Log => Log.id === logID);

		if (!Log) return;

		const xpReceived = quantity * Log.xp;

		await user.addXP(SkillsEnum.Woodcutting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Woodcutting);

		let str = `${user}, ${user.minionName} finished Woodcutting ${quantity} ${
			Log.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Woodcutting level is now ${newLevel}!`;
		}

		const loot = {
			[Log.id]: quantity
		};

		// Roll for pet at 1.5x chance
		if (Log.petChance && rand(1, Log.petChance * 1.5) < quantity) {
			loot[WoodcuttingPet!] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Woodcutting} **${user}'s** minion, ${user.minionName}, just received a Beaver while cutting ${Log.name} at level ${currentLevel} Woodcutting!`
			);
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;
						user.log(`continued trip of ${quantity}x ${Log.name}[${Log.id}]`);
						this.client.commands
							.get('chop')!
							.run(response as KlasaMessage, [quantity, Log.name]);
					}
				})
				.catch(noOp);
		});
	}
}
