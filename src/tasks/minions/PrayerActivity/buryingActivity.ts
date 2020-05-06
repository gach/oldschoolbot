import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../../lib/util';
import { Time } from '../../../lib/constants';
import { BuryingActivityTaskOptions } from '../../../lib/types/minions';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import Prayer from '../../../lib/skilling/skills/prayer';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../../lib/skilling/types';

export default class extends Task {
	async run({ boneID, quantity, userID, channelID }: BuryingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Prayer);

		const Bury = Prayer.Bones.find(Bury => Bury.inputId === boneID);

		if (!Bury) return;

		const xpmod = 1;
		const xpReceived = quantity * Bury.xp * xpmod;

		await user.addXP(SkillsEnum.Prayer, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished burying ${quantity} ${
			Bury.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Prayer level is now ${newLevel}!`;
		}

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
						user.log(`continued trip of ${quantity}x ${Bury.name}[${Bury.inputId}]`);
						this.client.commands
							.get('bury')!
							.run(response as KlasaMessage, [quantity, Bury.name]);
					}
				})
				.catch(noOp);
		});
	}
}
