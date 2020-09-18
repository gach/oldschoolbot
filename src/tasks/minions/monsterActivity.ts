import { MessageAttachment } from 'discord.js';
import { KlasaMessage, Task } from 'klasa';

import MinionCommand from '../../commands/Minion/minion';
import { customClientOptions } from '../../config';
import { alphaNumericalChars, Emoji, Events, PerkTier, Time } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { randomItemFromArray } from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

const charsWithoutC = alphaNumericalChars.filter(char => char !== 'c');

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity, duration }: MonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		const loot = monster.table.kill(quantity);
		announceLoot(this.client, user, monster, quantity, loot);

		await user.addItemsToBank(loot, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user
			);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received Minion Loot - ${logInfo}`
		);

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) +
			quantity}.`;

		const clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0);

		if (clueTiersReceived.length > 0) {
			str += `\n ${Emoji.Casket} You got clue scrolls in your loot (${clueTiersReceived
				.map(tier => tier.name)
				.join(', ')}).`;
			if (getUsersPerkTier(user) > PerkTier.One) {
				str += `\n\nSay \`c\` if you want to complete this ${clueTiersReceived[0].name} clue now.`;
			} else {
				str += `\n\nYou can get your minion to complete them using \`+minion clue easy/medium/etc \``;
			}
		}

		user.incrementMonsterScore(monsterID, quantity);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		const perkTier = getUsersPerkTier(user);
		const continuationChar = perkTier > PerkTier.One ? 'y' : randomItemFromArray(charsWithoutC);

		str += `\nSay \`${continuationChar}\` to repeat this trip.`;

		this.client.queuePromise(() => {
			channel.send(str, new MessageAttachment(image));
			channel
				.awaitMessages(
					(msg: KlasaMessage) => {
						if (msg.author !== user) return false;
						return (
							(perkTier > PerkTier.One &&
								msg.content.toLowerCase() === 'c' &&
								clueTiersReceived.length > 0) ||
							msg.content.toLowerCase() === continuationChar ||
							msg.content.startsWith(String(customClientOptions.prefix))
						);
					},
					{
						time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
						max: 1
					}
				)
				.then(async messages => {
					const response = messages.first();
					if (response) {
						if (response.author.minionIsBusy) return;
						if (response.content.startsWith(String(customClientOptions.prefix)))
							throw ''; // a new command was issued, cancel this now.
						if (perkTier > PerkTier.One && response.content.toLowerCase() === 'c') {
							await (this.client.commands.get(
								'minion'
							) as MinionCommand).clue(response as KlasaMessage, [
								1,
								clueTiersReceived[0].name
							]);
							return;
						}
						user.log(`continued trip of ${quantity}x ${monster.name}[${monster.id}] `);

						this.client.commands
							.get('minion')!
							.kill(response as KlasaMessage, [quantity, monster.name])
							.catch(err => channel.send(err));
					}
				});
		});
	}
}
