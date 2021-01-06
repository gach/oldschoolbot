import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const rabbitSnaringCreatures: Creature[] = [
	{
		name: `White rabbit`,
		id: 30,
		aliases: ['white rabbit', 'rabbit'],
		level: 27,
		hunterXp: 144,
		itemsConsumed: resolveNameBank({ Ferret: 1 }),
		table: new LootTable().every('Bones').every('Raw rabbit').every('Rabbit foot'),
		huntTechnique: 'rabbit snaring',
		multiTraps: true,
		catchTime: 40,
		slope: 1.2,
		intercept: 34
	}
];

export default rabbitSnaringCreatures;
