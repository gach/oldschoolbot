/* eslint-disable @typescript-eslint/no-namespace */
import { Bank as BankType } from './types';
import { GearTypes } from './gear';
import { SkillsEnum } from './skilling/types';

export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export namespace UserSettings {
	export const GP = T<number>('GP');
	export const QP = T<number>('QP');
	export const Bank = T<BankType>('bank');
	export const BankBackground = T<number>('bankBackground');
	export const Pets = T<BankType>('pets');
	export const CollectionLogBank = T<BankType>('collectionLogBank');
	export const MonsterScores = T<BankType>('monsterScores');
	export const ClueScores = T<BankType>('clueScores');
	export const LastDailyTimestamp = T<number>('lastDailyTimestamp');
	export const BitField = T<readonly number[]>('bitfield');
	export const Badges = T<readonly number[]>('badges');
	export const RSN = T<string>('RSN');
	export const TotalCommandsUsed = T<number>('totalCommandsUsed');

	export namespace Stats {
		export const Deaths = T<number>('stats.deaths');

		export const DiceWins = T<number>('stats.diceWins');
		export const DiceLosses = T<number>('stats.diceLosses');

		export const DuelWins = T<number>('stats.duelWins');
		export const DuelLosses = T<number>('stats.duelLosses');
	}

	export namespace Minion {
		export const Name = T<string>('minion.name');

		export const HasBought = T<boolean>('minion.hasBought');
		export const DailyDuration = T<number>('minion.dailyDuration');
		export const Ironman = T<boolean>('minion.ironman');
	}

	export namespace Slayer {
		export const SlayerInfo = T<number[]>('slayer.slayerInfo');
		export const BlockList = T<number[]>('slayer.blockList');
		export const ExtendList = T<number[]>('slayer.extendList');
		export const UnlockedList = T<number[]>('slayer.unlockedList');
	}

	export namespace Skills {
		export const Agility = T<number>(`skills.${SkillsEnum.Agility}`);
		export const Cooking = T<number>(`skills.${SkillsEnum.Cooking}`);
		export const Fishing = T<number>(`skills.${SkillsEnum.Fishing}`);
		export const Prayer = T<number>(`skills.${SkillsEnum.Prayer}`);
		export const Slayer = T<number>(`skills.${SkillsEnum.Slayer}`);
		export const Strength = T<number>(`skills.${SkillsEnum.Strength}`);
		export const Magic = T<number>(`skills.${SkillsEnum.Magic}`);
		export const Mining = T<number>(`skills.${SkillsEnum.Mining}`);
		export const Smithing = T<number>(`skills.${SkillsEnum.Smithing}`);
		export const Woodcutting = T<string>(`skills.${SkillsEnum.Woodcutting}`);
		export const Firemaking = T<number>(`skills.${SkillsEnum.Firemaking}`);
		export const Runecraft = T<number>(`skills.${SkillsEnum.Runecraft}`);
	}

	export namespace Gear {
		export const Melee = T<GearTypes.GearSetup>(`gear.melee`);
		export const Range = T<GearTypes.GearSetup>(`gear.range`);
		export const Mage = T<GearTypes.GearSetup>(`gear.mage`);
		export const Misc = T<GearTypes.GearSetup>(`gear.misc`);
		export const Skilling = T<GearTypes.GearSetup>(`gear.skilling`);
	}
}
