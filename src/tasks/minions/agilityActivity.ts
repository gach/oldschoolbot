import { randInt, roll } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events, Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: AgilityActivityTaskOptions) {
		let { courseID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID)!;

		// Calculate failed laps
		let lapsFailed = 0;
		for (let t = 0; t < quantity; t++) {
			if (
				randInt(1, 100) >
				(100 * user.skillLevel(SkillsEnum.Agility)) / (course.level + 5)
			) {
				lapsFailed += 1;
			}
		}

		// Calculate marks of grace
		let totalMarks = 0;
		const timePerLap = course.lapTime * Time.Second;
		const maxQuantity = Math.floor(user.maxTripLength / timePerLap);
		if (course.marksPer60) {
			for (let i = 0; i < Math.floor(course.marksPer60 * (quantity / maxQuantity)); i++) {
				if (roll(2)) {
					totalMarks += 1;
				}
			}
		}
		if (user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
			totalMarks = Math.ceil(totalMarks / 5);
		}

		const xpReceived = (quantity - lapsFailed / 2) * course.xp;

		await user.settings.update(
			UserSettings.LapsScores,
			addItemToBank(
				user.settings.get(UserSettings.LapsScores),
				course.id,
				quantity - lapsFailed
			)
		);

		const xpRes = await user.addXP(SkillsEnum.Agility, xpReceived, duration);

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
		} laps and fell on ${lapsFailed} of them, you also received ${xpReceived.toLocaleString()} XP and ${totalMarks}x Mark of grace. ${xpRes}`;

		const loot = new Bank({
			'Mark of grace': totalMarks
		});

		if (course.id === 6) {
			const currentLapCount = user.settings.get(UserSettings.LapsScores)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasItemEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					str += `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}

		// Roll for pet
		if (
			course.petChance &&
			roll((course.petChance - user.skillLevel(SkillsEnum.Agility) * 25) / quantity)
		) {
			loot.add('Giant squirrel');
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Agility} **${user.username}'s** minion, ${user.minionName}, just received a Giant squirrel while running ${course.name} laps at level ${currentLevel} Agility!`
			);
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${course.name} laps`);
				return this.client.commands.get('laps')!.run(res, [quantity, course.aliases[0]]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
