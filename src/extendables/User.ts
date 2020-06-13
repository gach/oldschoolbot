import { Extendable, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { UserSettings } from '../lib/settings/types/UserSettings';
import { KillableMonster } from '../lib/minions/types';
import { formatItemReqs } from '../lib/util/formatItemReqs';
import { itemNameFromID, toTitleCase } from '../lib/util';
import { Skills } from '../lib/types';
import { SkillsEnum } from '../lib/skilling/types';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public get rawSkills(this: User) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		return this.settings.get('skills').toJSON() as Skills;
	}

	public hasMonsterRequirements(this: User, monster: KillableMonster) {
		if (monster.qpRequired && this.settings.get(UserSettings.QP) < monster.qpRequired) {
			return [
				false,
				`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`+quest\``
			];
		}

		if (monster.itemsRequired) {
			const itemsRequiredStr = formatItemReqs(monster.itemsRequired);
			for (const item of monster.itemsRequired) {
				if (Array.isArray(item)) {
					if (!item.some(itemReq => this.hasItemEquippedOrInBank(itemReq as number))) {
						return [
							false,
							`You need these items to kill ${monster.name}: ${itemsRequiredStr}`
						];
					}
				} else if (!this.hasItemEquippedOrInBank(item)) {
					return [
						false,
						`You need ${itemsRequiredStr} to kill ${
							monster.name
						}. You're missing ${itemNameFromID(item)}.`
					];
				}
			}
		}

		if (monster.levelRequirements) {
			for (const [skillEnum, levelRequired] of Object.entries(monster.levelRequirements)) {
				if (this.skillLevel(skillEnum as SkillsEnum) < (levelRequired as number)) {
					return [
						false,
						`You need level ${levelRequired} ${toTitleCase(skillEnum)} to kill ${
							monster.name
						}. Check https://www.oldschool.gg/oldschoolbot/minions?${toTitleCase(
							skillEnum
						)} for information on how to train this skill.`
					];
				}
			}
		}

		return [true];
	}
}
