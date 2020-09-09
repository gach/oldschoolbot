import { Image } from 'canvas';
import { BeginnerCasket } from 'oldschooljs/dist/simulation/clues/Beginner';
import { MediumCasket } from 'oldschooljs/dist/simulation/clues/Medium';
import { EasyCasket } from 'oldschooljs/dist/simulation/clues/Easy';
import { HardCasket } from 'oldschooljs/dist/simulation/clues/Hard';
import { EliteCasket } from 'oldschooljs/dist/simulation/clues/Elite';
import { MasterCasket } from 'oldschooljs/dist/simulation/clues/Master';

import { Bank, ArrayItemsResolved } from '../types';
import { PerkTier } from '../constants';
import { MonsterActivityTaskOptions } from '../types/minions';
import { LevelRequirements } from '../skilling/types';
import { GearSetupTypes, OffenceGearStat, GearStat } from '../gear/types';
import { Item } from 'oldschooljs/dist/meta/types';

export interface BankBackground {
	image: Image | null;
	id: number;
	name: string;
	available: boolean;
	collectionLogItemsNeeded?: Bank;
	perkTierNeeded?: PerkTier;
	gpCost?: number;
	itemCost?: Bank;
}

export interface ClueMilestoneReward {
	itemReward: number;
	scoreNeeded: number;
}

export interface ClueTier {
	name: string;
	table: BeginnerCasket | EasyCasket | MediumCasket | HardCasket | EliteCasket | MasterCasket;
	id: number;
	scrollID: number;
	timeToFinish: number;
	milestoneReward?: ClueMilestoneReward;
	mimicChance: number | false;
}

export interface KillableMonster {
	id: number;
	name: string;
	aliases: string[];
	timeToFinish: number;
	table: {
		kill(quantity: number): Bank;
	};
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
	difficultyRating: number;
	itemsRequired?: ArrayItemsResolved;
	notifyDrops?: ArrayItemsResolved;
	qpRequired: number;

	/**
	 * A object of ([key: itemID]: boostPercentage) boosts that apply to
	 * this monster.
	 */
	itemInBankBoosts?: Bank;
	/**
	 * Whether or not this monster can be groupkilled.
	 */
	groupKillable?: true;
	respawnTime?: number;
	levelRequirements?: LevelRequirements;
	uniques?: ArrayItemsResolved;
	/**
	 * How much healing (health points restored) is needed per kill.
	 */
	healAmountNeeded?: number;
	attackStyleToUse?: GearSetupTypes;
	attackStylesUsed?: OffenceGearStat[];
	minimumGearRequirements?: Partial<{ [key in GearStat]: number }>;
}

export interface GroupMonsterActivityTaskOptions extends MonsterActivityTaskOptions {
	leader: string;
	users: string[];
}

export interface Minigame {
	id: number;
	name: string;
}

export interface ItemList {
	qty: number;
	possibilities: Item[];
}
