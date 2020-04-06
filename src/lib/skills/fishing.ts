import { SkillsEnum, Fish } from '../types';
import { Emoji } from '../constants';
import itemID from '../util/itemID';

const fishes: Fish[] = [
	{
		level: 1,
		xp: 10,
		id: itemID('Raw shrimps'),
		name: 'Shrimps',
		petChance: 435_165,
		timePerFish: 3.6,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 5,
		xp: 20,
		id: itemID('Raw sardine'),
		name: 'Sardine',
		petChance: 528_000,
		bait: itemID('Fishing bait'),
		timePerFish: 3.6,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 5,
		xp: 20,
		id: itemID('Raw karambwanji'),
		name: 'Karambwanji',
		petChance: 443_697,
		qpRequired: 15,
		timePerFish: 3.6,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 10,
		xp: 30,
		id: itemID('Raw herring'),
		name: 'Herring',
		petChance: 528_000,
		bait: itemID('Fishing bait'),
		timePerFish: 3.6,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 15,
		xp: 40,
		id: itemID('Raw anchovies'),
		name: 'Anchovies',
		petChance: 435_165,
		timePerFish: 7,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 16,
		xp: 20,
		id: itemID('Raw mackerel'),
		name: 'Mackerel',
		petChance: 382_609,
		timePerFish: 3.6,
		itemRequirement: itemID('Big fishing net')
	},
	{
		level: 20,
		xp: 50,
		id: itemID('Raw trout'),
		name: 'Trout',
		petChance: 461_808,
		bait: itemID('Feather'),
		timePerFish: 4.5,
		itemRequirement: itemID('Fly fishing rod')
	},
	{
		level: 23,
		xp: 45,
		id: itemID('Raw cod'),
		name: 'Cod',
		petChance: 382_609,
		timePerFish: 5,
		itemRequirement: itemID('Big fishing net')
	},
	{
		level: 25,
		xp: 60,
		id: itemID('Raw pike'),
		name: 'Pike',
		petChance: 305_792,
		bait: itemID('Fishing bait'),
		timePerFish: 6,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 30,
		xp: 70,
		id: itemID('Raw salmon'),
		name: 'Salmon',
		petChance: 461_808,
		bait: itemID('Feather'),
		timePerFish: 5.04,
		itemRequirement: itemID('Fly fishing rod')
	},
	{
		level: 35,
		xp: 80,
		id: itemID('Raw tuna'),
		name: 'Tuna',
		petChance: 128_885,
		timePerFish: 9.6,
		itemRequirement: itemID('Harpoon')
	},
	{
		level: 40,
		xp: 90,
		id: itemID('Raw lobster'),
		name: 'Lobster',
		petChance: 116_129,
		timePerFish: 11,
		itemRequirement: itemID('Lobster pot')
	},
	{
		level: 46,
		xp: 100,
		id: itemID('Raw bass'),
		name: 'Bass',
		petChance: 382_609,
		timePerFish: 10.3,
		itemRequirement: itemID('Big fishing net'),
		bigFish: itemID('Big bass'),
		bigFishRate: 1000
	},
	{
		level: 50,
		xp: 100,
		id: itemID('Raw swordfish'),
		name: 'Swordfish',
		petChance: 128_885,
		timePerFish: 11,
		itemRequirement: itemID('Harpoon'),
		bigFish: itemID('Big swordfish'),
		bigFishRate: 2500
	},
	{
		level: 62,
		xp: 120,
		id: itemID('Raw monkfish'),
		name: 'Monkfish',
		petChance: 138_583,
		qpRequired: 100,
		timePerFish: 13.5,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 65,
		xp: 50,
		id: itemID('Raw karambwan'),
		name: 'Karambwan',
		petChance: 170_874,
		bait: itemID('Raw karambwanji'),
		timePerFish: 4.5,
		itemRequirement: itemID('Karambwan vessel')
	},
	{
		level: 76,
		xp: 110,
		id: itemID('Raw shark'),
		name: 'Shark',
		petChance: 82_243,
		timePerFish: 30,
		itemRequirement: itemID('Harpoon'),
		bigFish: itemID('Big shark'),
		bigFishRate: 5000
	},
	{
		level: 82,
		xp: 120,
		id: itemID('Raw anglerfish'),
		name: 'Anglerfish',
		petChance: 78_649,
		bait: itemID('Sandworms'),
		qpRequired: 40,
		timePerFish: 18.75,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 85,
		xp: 130,
		id: itemID('Raw dark crab'),
		name: 'Dark crab',
		petChance: 149_434,
		bait: itemID('Dark fishing bait'),
		timePerFish: 11.7,
		itemRequirement: itemID('Lobster pot')
	},
	{
		level: 48,
		xp: 130,
		id: itemID('Leaping trout'),
		name: 'Barbarian fishing',
		petChance: 426_954,
		bait: itemID('Feather'),
		timePerFish: 3,
		itemRequirement: itemID('Barbarian rod')
	}
];

const anglerItems: { [key: number]: number } = {
	[itemID('Angler hat')]: 0.4,
	[itemID('Angler top')]: 0.8,
	[itemID('Angler waders ')]: 0.6,
	[itemID('Angler boots')]: 0.2
};

const Fishing = {
	Fishes: fishes,
	id: SkillsEnum.Fishing,
	emoji: Emoji.Fishing,
	anglerItems
};

export default Fishing;
