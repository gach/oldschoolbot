import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Pickpocketables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { addBanks, formatDuration, round, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (msg.flagArgs.xphr && msg.author.id === '157797566833098752') {
			let str = '';
			for (let i = 1; i < 100; i += 5) {
				str += `\n---- Level ${i} ----`;
				let results: [string, number, number][] = [];
				for (const npc of Pickpocketables) {
					if (i < npc.level) continue;
					const [, damageTaken, xpReceived] = calcLootXPPickpocketing(
						i,
						npc,
						5 * (Time.Hour / ((npc.customTickRate ?? 2) * 600))
					);
					results.push([npc.name, round(xpReceived, 2) / 5, damageTaken / 5]);
				}
				for (const [name, xp, damageTaken] of results.sort((a, b) => a[1] - b[1])) {
					str += `\n${name} ${xp.toLocaleString()} XP/HR and ${
						damageTaken / 20
					} Sharks/hr`;
				}
				str += '\n\n\n';
			}
			return msg.channel.sendFile(Buffer.from(str), 'output.txt');
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const pickpocketable = Pickpocketables.find(npc => stringMatches(npc.name, name));

		if (!pickpocketable) {
			return msg.send(
				`That is not a valid NPC to pickpocket, try pickpocketing one of the following: ${Pickpocketables.map(
					npc => npc.name
				).join(', ')}.`
			);
		}

		if (
			pickpocketable.qpRequired &&
			msg.author.settings.get(UserSettings.QP) < pickpocketable.qpRequired
		) {
			return msg.send(
				`You need atleast **${pickpocketable.qpRequired}** QP to pickpocket a ${pickpocketable.name}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Thieving) < pickpocketable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${pickpocketable.level} Thieving to pickpocket a ${pickpocketable.name}.`
			);
		}

		const timeToPickpocket = (pickpocketable.customTickRate ?? 2) * 600;

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToPickpocket);
		}

		const duration = quantity * timeToPickpocket;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of times you can pickpocket a ${
					pickpocketable.name
				} is ${Math.floor(msg.author.maxTripLength / timeToPickpocket)}.`
			);
		}

		const [successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
			msg.author.skillLevel(SkillsEnum.Thieving),
			pickpocketable,
			quantity
		);

		const [foodString, foodRemoved] = await removeFoodFromUser(
			this.client,
			msg.author,
			damageTaken,
			Math.ceil(damageTaken / quantity),
			'Pickpocketing'
		);

		await this.client.settings.update(
			ClientSettings.EconomyStats.ThievingCost,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.ThievingCost),
				foodRemoved
			])
		);

		await addSubTaskToActivityTask<PickpocketActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				monsterID: pickpocketable.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Pickpocket,
				damageTaken,
				successfulQuantity,
				xpReceived
			}
		);

		return msg.send(
			`${msg.author.minionName} is now going to pickpocket a ${
				pickpocketable.name
			} ${quantity}x times, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${foodString}`
		);
	}
}
