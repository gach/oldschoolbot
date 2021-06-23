import LootTable from 'oldschooljs/dist/structures/LootTable';

export interface XPLamp {
	itemID: number;
	amount: number;
	name: string;
}

export const XPLamps: XPLamp[] = [
	// Achievement diary lamps
	{
		itemID: 11137,
		amount: 2500,
		name: 'Antique lamp 1'
	},
	{
		itemID: 11139,
		amount: 7500,
		name: 'Antique lamp 2'
	},
	{
		itemID: 11141,
		amount: 15_000,
		name: 'Antique lamp 3'
	},
	{
		itemID: 11185,
		amount: 50_000,
		name: 'Antique lamp 4'
	},
	// BSO Lamps
	{
		itemID: 6796,
		amount: 20_000,
		name: 'Tiny lamp'
	},
	{
		itemID: 21642,
		amount: 50_000,
		name: 'Small lamp'
	},
	{
		itemID: 23516,
		amount: 100_000,
		name: 'Average lamp'
	},
	{
		itemID: 22320,
		amount: 1_000_000,
		name: 'Large lamp'
	},
	{
		itemID: 11157,
		amount: 5_000_000,
		name: 'Huge lamp'
	}
];

export const LampTable = new LootTable()
	.add(6796, 1, 40)
	.add(21642, 1, 30)
	.add(23516, 1, 20)
	.add(22320, 1, 5)
	.add(11157, 1, 1);
