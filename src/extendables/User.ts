import { Extendable, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { UserSettings } from '../lib/settings/types/UserSettings';
import { KillableMonster } from '../lib/minions/types';
import { Openable } from '../lib/minions/types';
import { formatItemReqs } from '../lib/util/formatItemReqs';
import { itemNameFromID, toTitleCase } from '../lib/util';
import { Skills } from '../lib/types';
import { SkillsEnum } from '../lib/skilling/types';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2784
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
	
	public hasOpenableRequirements(this: User, chest: Openable) {
		if (chest.qpRequired && this.settings.get(UserSettings.QP) < chest.qpRequired) {
			return [
				false,
				`You need ${chest.qpRequired} QP to kill ${chest.name}. You can get Quest Points through questing with \`+quest\``
			];
		}

		if (chest.levelRequirements) {
			for (const [skillEnum, levelRequired] of Object.entries(chest.levelRequirements)) {
				if (this.skillLevel(skillEnum as SkillsEnum) < (levelRequired as number)) {
					return [
						false,
						`You need level ${levelRequired} ${toTitleCase(skillEnum)} to open ${
							chest.name
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
