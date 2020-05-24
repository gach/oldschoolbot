import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Darts: Fletchable[] = [
	{
		name: 'Bronze dart',
		id: itemID('Bronze dart'),
		level: 10,
		xp: 1.8,
		inputItems: { [itemID('Bronze dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	},
	{
		name: 'Iron dart',
		id: itemID('Iron dart'),
		level: 22,
		xp: 3.8,
		inputItems: { [itemID('Iron dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	},
	{
		name: 'Steel dart',
		id: itemID('Steel dart'),
		level: 37,
		xp: 7.5,
		inputItems: { [itemID('Steel dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	},
	{
		name: 'Mithril dart',
		id: itemID('Mithril dart'),
		level: 52,
		xp: 11.2,
		inputItems: { [itemID('Mithril dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	},
	{
		name: 'Adamant dart',
		id: itemID('Adamant dart'),
		level: 67,
		xp: 15,
		inputItems: { [itemID('Adamant dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	},
	{
		name: 'Rune dart',
		id: itemID('Rune dart'),
		level: 81,
		xp: 18.8,
		inputItems: { [itemID('Rune dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	},
	{
		name: 'Dragon dart',
		id: itemID('Dragon dart'),
		level: 95,
		xp: 25,
		inputItems: { [itemID('Dragon dart tip')]: 1, [itemID('Feather')]: 1 },
		tickRate: 0.08
	}
];

export default Darts;
