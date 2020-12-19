import { Client, SchemaFolder } from 'klasa';

import Farming from '../../farming';
import defaultContracts from '../../farming/defaultContracts';
import { FarmingPatchTypes } from '../../farming/types';
import Gear from '../../gear';
import { SkillsEnum } from '../../skilling/types';

Client.defaultUserSchema
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('GP', 'integer', { default: 0 })
	.add('QP', 'integer', { default: 0 })
	.add('RSN', 'string', { default: null })
	.add('pets', 'any', { default: {} })
	.add('badges', 'integer', { array: true, default: [] })
	.add('bitfield', 'integer', { array: true, default: [] })
	.add('favoriteItems', 'integer', { array: true, default: [] })
	.add('lastDailyTimestamp', 'integer', { default: 1 })
	.add('sacrificedValue', 'integer', { default: 0, maximum: 100_000_000_000, minimum: 0 })
	.add('bank', 'any', { default: {} })
	.add('collectionLogBank', 'any', { default: {} })
	.add('monsterScores', 'any', { default: {} })
	.add('clueScores', 'any', { default: {} })
	.add('minigameScores', 'any', { default: {} })
	.add('lapsScores', 'any', { default: {} })
	.add('bankBackground', 'integer', { default: 1 })
	.add('sacrificedBank', 'any', { default: {} })
	.add('honour_level', 'integer', { default: 1 })
	.add('honour_points', 'integer', { default: 0 })
	.add('minion', folder =>
		folder
			.add('name', 'string')
			.add('hasBought', 'boolean', { default: false })
			.add('dailyDuration', 'integer', { default: 0 })
			.add('ironman', 'boolean', { default: false })
			.add('icon', 'string', { default: null })
			.add('equippedPet', 'integer', { default: null })
			.add('farmingContract', 'any', { default: defaultContracts })
			.add('defaultCompostToUse', 'string', { default: 'compost' })
			.add('defaultPay', 'boolean', { default: false })
	)
	.add('stats', (folder: SchemaFolder) =>
		folder
			.add('deaths', 'integer', { default: 0 })
			.add('diceWins', 'integer', { default: 0 })
			.add('diceLosses', 'integer', { default: 0 })
			.add('duelLosses', 'integer', { default: 0 })
			.add('duelWins', 'integer', { default: 0 })
			.add('fightCavesAttempts', 'integer', { default: 0 })
			.add('fireCapesSacrificed', 'integer', { default: 0 })
			.add('titheFarmsCompleted', 'integer', { default: 0 })
			.add('titheFarmPoints', 'integer', { default: 0 })
	)
	.add('skills', (folder: SchemaFolder) =>
		folder
			.add(SkillsEnum.Agility, 'integer', { default: 0 })
			.add(SkillsEnum.Cooking, 'integer', { default: 0 })
			.add(SkillsEnum.Fishing, 'integer', { default: 0 })
			.add(SkillsEnum.Mining, 'integer', { default: 0 })
			.add(SkillsEnum.Smithing, 'integer', { default: 0 })
			.add(SkillsEnum.Woodcutting, 'integer', { default: 0 })
			.add(SkillsEnum.Firemaking, 'integer', { default: 0 })
			.add(SkillsEnum.Runecraft, 'integer', { default: 0 })
			.add(SkillsEnum.Crafting, 'integer', { default: 0 })
			.add(SkillsEnum.Prayer, 'integer', { default: 0 })
			.add(SkillsEnum.Fletching, 'integer', { default: 0 })
			.add(SkillsEnum.Thieving, 'integer', { default: 0 })
			.add(SkillsEnum.Farming, 'integer', { default: 0 })
	)
	.add('gear', (folder: SchemaFolder) =>
		folder
			.add('melee', 'any', { default: Gear.defaultGear })
			.add('mage', 'any', { default: Gear.defaultGear })
			.add('range', 'any', { default: Gear.defaultGear })
			.add('misc', 'any', { default: Gear.defaultGear })
			.add('skilling', 'any', { default: Gear.defaultGear })
	)
	.add('farmingPatches', (folder: SchemaFolder) =>
		folder
			.add(FarmingPatchTypes.Herb, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.FruitTree, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Tree, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Allotment, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Hops, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Cactus, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Bush, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Spirit, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Hardwood, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Seaweed, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Vine, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Calquat, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Redwood, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Crystal, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Celastrus, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Hespori, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Flower, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Mushroom, 'any', { default: Farming.defaultPatches })
			.add(FarmingPatchTypes.Belladonna, 'any', { default: Farming.defaultPatches })
	);
