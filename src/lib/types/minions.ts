import { Activity, Tasks } from '../constants';
import { PatchTypes } from '../farming';
import { MinigameIDsEnum } from '../minions/data/minigames';
import { GroupMonsterActivityTaskOptions } from '../minions/types';

export interface ActivityTaskOptions {
	type: Activity;
	userID: string;
	duration: number;
	id: string;
	finishDate: number;
	channelID: string;
}

export interface AgilityActivityTaskOptions extends ActivityTaskOptions {
	courseID: string;
	quantity: number;
}

export interface CookingActivityTaskOptions extends ActivityTaskOptions {
	cookableID: number;
	quantity: number;
}

export interface MonsterActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	quantity: number;
}

export interface ClueActivityTaskOptions extends ActivityTaskOptions {
	clueID: number;
	quantity: number;
}

export interface FishingActivityTaskOptions extends ActivityTaskOptions {
	fishID: number;
	quantity: number;
}

export interface MiningActivityTaskOptions extends ActivityTaskOptions {
	oreID: number;
	quantity: number;
}

export interface SmeltingActivityTaskOptions extends ActivityTaskOptions {
	barID: number;
	quantity: number;
}

export interface SmithingActivityTaskOptions extends ActivityTaskOptions {
	smithedBarID: number;
	quantity: number;
}

export interface FiremakingActivityTaskOptions extends ActivityTaskOptions {
	burnableID: number;
	quantity: number;
}

export interface WoodcuttingActivityTaskOptions extends ActivityTaskOptions {
	logID: number;
	quantity: number;
}

export interface CraftingActivityTaskOptions extends ActivityTaskOptions {
	craftableID: number;
	quantity: number;
}

export interface FletchingActivityTaskOptions extends ActivityTaskOptions {
	fletchableName: string;
	quantity: number;
}

export interface PickpocketActivityTaskOptions extends ActivityTaskOptions {
	monsterID: number;
	quantity: number;
	xpReceived: number;
	successfulQuantity: number;
	damageTaken: number;
}

export interface BuryingActivityTaskOptions extends ActivityTaskOptions {
	boneID: number;
	quantity: number;
}

export interface OfferingActivityTaskOptions extends ActivityTaskOptions {
	boneID: number;
	quantity: number;
}

export interface AlchingActivityTaskOptions extends ActivityTaskOptions {
	itemID: number;
	quantity: number;
	alchValue: number;
}

export interface QuestingActivityTaskOptions extends ActivityTaskOptions {}

export interface FarmingActivityTaskOptions extends ActivityTaskOptions {
	plantsName: string | null;
	channelID: string;
	quantity: number;
	upgradeType: 'compost' | 'supercompost' | 'ultracompost' | null;
	payment?: boolean;
	patchType: PatchTypes.PatchData;
	getPatchType: string;
	planting: boolean;
	currentDate: number;
}

export interface MinigameActivityTaskOptions extends ActivityTaskOptions {
	minigameID: MinigameIDsEnum;
	quantity: number;
}

export interface FishingTrawlerActivityTaskOptions extends MinigameActivityTaskOptions {}
export interface DeliverPresentsActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface FightCavesActivityTaskOptions extends MinigameActivityTaskOptions {
	jadDeathChance: number;
	preJadDeathChance: number;
	preJadDeathTime: number | null;
}

export interface NightmareActivityTaskOptions extends MinigameActivityTaskOptions {
	leader: string;
	users: string[];
}

export interface WintertodtActivityTaskOptions extends MinigameActivityTaskOptions {
	quantity: number;
}

export interface TitheFarmActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface AnimatedArmourActivityTaskOptions extends MinigameActivityTaskOptions {
	armourID: string;
	quantity: number;
}

export interface CyclopsActivityTaskOptions extends MinigameActivityTaskOptions {
	quantity: number;
}

export interface SepulchreActivityTaskOptions extends MinigameActivityTaskOptions {
	floors: number[];
}

export interface PlunderActivityTaskOptions extends MinigameActivityTaskOptions {
	rooms: number[];
}

export interface ZalcanoActivityTaskOptions extends MinigameActivityTaskOptions {
	isMVP: boolean;
	performance: number;
}

export interface BarbarianAssaultActivityTaskOptions extends MinigameActivityTaskOptions {
	leader: string;
	users: string[];
	totalLevel: number;
}

export interface AgilityArenaActivityTaskOptions extends MinigameActivityTaskOptions {}

export interface MonsterKillingTickerTaskData {
	subTasks: (MonsterActivityTaskOptions | GroupMonsterActivityTaskOptions)[];
}

export interface ClueTickerTaskData {
	subTasks: ClueActivityTaskOptions[];
}

export interface SkillingTickerTaskData {
	subTasks: ActivityTaskOptions[];
}

export interface SawmillActivityTaskOptions extends ActivityTaskOptions {
	plankID: number;
	plankQuantity: number;
}

export interface MinigameTickerTaskData {
	subTasks: (
		| FightCavesActivityTaskOptions
		| WintertodtActivityTaskOptions
		| NightmareActivityTaskOptions
		| SepulchreActivityTaskOptions
		| FishingTrawlerActivityTaskOptions
		| TitheFarmActivityTaskOptions
		| DeliverPresentsActivityTaskOptions
		| PlunderActivityTaskOptions
	)[];
}

export type TickerTaskData =
	| MonsterKillingTickerTaskData
	| ClueTickerTaskData
	| SkillingTickerTaskData
	| MinigameTickerTaskData;

export type MinionActivityTask = Tasks;
