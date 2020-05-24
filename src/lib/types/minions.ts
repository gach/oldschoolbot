import { Activity, Tasks } from '../constants';
import { GroupMonsterActivityTaskOptions } from '../minions/types';

export interface ActivityTaskOptions {
	type: Activity;
	userID: string;
	duration: number;
	id: number;
	finishDate: number;
}

export interface AgilityActivityTaskOptions extends ActivityTaskOptions {
	courseID: string;
	channelID: string;
	quantity: number;
}

export interface CookingActivityTaskOptions extends ActivityTaskOptions {
	cookableID: number;
	channelID: string;
	quantity: number;
}

export interface MonsterActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	channelID: string;
	quantity: number;
}

export interface ClueActivityTaskOptions extends ActivityTaskOptions {
	clueID: number;
	channelID: string;
	quantity: number;
}

export interface FishingActivityTaskOptions extends ActivityTaskOptions {
	fishID: number;
	channelID: string;
	quantity: number;
}

export interface MiningActivityTaskOptions extends ActivityTaskOptions {
	oreID: number;
	channelID: string;
	quantity: number;
}

export interface SmeltingActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	channelID: string;
	quantity: number;
}

export interface SmithingActivityTaskOptions extends ActivityTaskOptions {
	smithedBarID: number;
	channelID: string;
	quantity: number;
}

export interface FiremakingActivityTaskOptions extends ActivityTaskOptions {
	burnableID: number;
	channelID: string;
	quantity: number;
}

export interface WoodcuttingActivityTaskOptions extends ActivityTaskOptions {
	logID: number;
	channelID: string;
	quantity: number;
}

export interface CraftingActivityTaskOptions extends ActivityTaskOptions {
	craftableID: number;
	channelID: string;
	quantity: number;
}

export interface FletchingActivityTaskOptions extends ActivityTaskOptions {
	fletchableID: number;
	channelID: string;
	quantity: number;
}

export interface BuryingActivityTaskOptions extends ActivityTaskOptions {
	boneID: number;
	channelID: string;
	quantity: number;
}

export interface OfferingActivityTaskOptions extends ActivityTaskOptions {
	boneID: number;
	channelID: string;
	quantity: number;
}

export interface QuestingActivityTaskOptions extends ActivityTaskOptions {
	channelID: string;
}

export interface MinigameActivityTaskOptions extends ActivityTaskOptions {
	minigameID: number;
	channelID: string;
	quantity: number;
}

export interface FightCavesActivityTaskOptions extends MinigameActivityTaskOptions {
	jadDeathChance: number;
	preJadDeathChance: number;
	preJadDeathTime: number | null;
}

export interface MonsterKillingTickerTaskData {
	subTasks: (MonsterActivityTaskOptions | GroupMonsterActivityTaskOptions)[];
}

export interface ClueTickerTaskData {
	subTasks: ClueActivityTaskOptions[];
}

export interface SkillingTickerTaskData {
	subTasks: ActivityTaskOptions[];
}

export interface MinigameTickerTaskData {
	subTasks: FightCavesActivityTaskOptions[];
}

export type TickerTaskData =
	| MonsterKillingTickerTaskData
	| ClueTickerTaskData
	| SkillingTickerTaskData
	| MinigameTickerTaskData;

export type MinionActivityTask =
	| Tasks.CraftingActivity
	| Tasks.AgilityActivity
	| Tasks.CookingActivity
	| Tasks.MonsterActivity
	| Tasks.GroupMonsterActivity
	| Tasks.ClueActivity
	| Tasks.FishingActivity
	| Tasks.MiningActivity
	| Tasks.SmeltingActivity
	| Tasks.SmithingActivity
	| Tasks.WoodcuttingActivity
	| Tasks.RunecraftActivity
	| Tasks.FiremakingActivity
	| Tasks.QuestingActivity
	| Tasks.BuryingActivity
	| Tasks.OfferingActivity
	| Tasks.FightCavesActivity
	| Tasks.FletchingActivity;
