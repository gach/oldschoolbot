export enum FarmingPatchTypes {
	Herb = 'herb',
	FruitTree = 'fruit tree',
	Tree = 'tree',
	Allotment = 'allotment',
	Cactus = 'cactus',
	Bush = 'bush',
	Flower = 'flower',
	Spirit = 'spirit',
	Hardwood = 'hardwood',
	Seaweed = 'seaweed',
	Vine = 'vine',
	Calquat = 'calquat',
	Redwood = 'redwood',
	Crystal = 'crystal',
	Celastrus = 'celastrus',
	Hespori = 'hespori'
}

export interface PatchData {
	lastPlanted: string | null;
	patchPlanted: boolean; // false -> nothing planted, true -> something planted
	plantTime: number;
	lastQuantity: number;
	lastUpgradeType: 'compost' | 'supercompost' | 'ultracompost' | 'null' | null;
	lastPayment: boolean;
}

export type PlantTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface FarmingContract {
	hasContract: boolean;
	difficultyLevel: 'easy' | 'medium' | 'hard' | null;
	plantToGrow: string | null;
	plantTier: PlantTier;
	contractsCompleted: number;
}

export type CompostTier = 'compost' | 'supercompost' | 'ultracompost';
