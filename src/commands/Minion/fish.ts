import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, formatDuration, rand } from '../../lib/util';
import Fishing from '../../lib/skills/fishing';
import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { UserSettings } from '../../lib/UserSettings';
import { roll } from 'oldschooljs/dist/util/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const fish = Fishing.Fishies.find(
			fish => stringMatches(fish.name, name) || stringMatches(fish.name.split(' ')[0], name)
		);

		if (!fish) {
			throw `Thats not a valid fish to catch. Valid fishies are ${Fishing.Fishies.map(
				fish => fish.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Fishing) < fish.level) {
			throw `${msg.author.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`;
		}

		if (fish.qpRequired) {
			if (msg.author.settings.get(UserSettings.QP) < fish.qpRequired) {
				throw `You need ${fish.qpRequired} qp to catch those!`;
			}
		}

		await msg.author.settings.sync(true);

		const hasItem = await msg.author.hasItem(fish.itemRequirement, 1);
		if (!hasItem) {
			throw `${msg.author.minionName} doesn't have the proper equipment to fish ${fish.name}.`;
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(
				(Time.Minute * 30) /
					(Time.Second *
						fish.timePerFish *
						(1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100))
			);
		}

		if (fish.bait) {
			const hasBait = await msg.author.hasItem(fish.bait, quantity);
			if (!hasBait) {
				throw `${msg.author.minionName} doesn't have the proper bait to fish ${fish.name}.`;
			}
		}

		const duration =
			quantity *
			Time.Second *
			fish.timePerFish *
			(1 + (100 - msg.author.skillLevel(SkillsEnum.Fishing)) / 100);

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				fish.name
			} you can fish is approximately ${Math.floor(
				(Time.Minute * 30) / (Time.Second * fish.timePerFish) - 4
			)}.`;
		}

		// Add some variability
		if (roll(2)) {
			quantity += rand(1, Math.ceil(3500 / quantity));
		} else {
			quantity -= rand(1, Math.ceil(3500 / quantity));
		}

		const data: FishingActivityTaskOptions = {
			fishID: fish.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Fishing,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// Remove the bait from their bank.
		if (fish.bait) {
			await msg.author.removeItemFromBank(fish.bait, quantity);
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		const response = `${msg.author.minionName} is now fishing ${quantity}x ${
			fish.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
