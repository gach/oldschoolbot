import { Clues } from 'oldschooljs';

const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

import { Time } from '../../constants';
import { ClueTier } from '../types';
import itemID from '../../util/itemID';

const ClueTiers: ClueTier[] = [
	{
		name: 'Beginner',
		table: Beginner,
		id: 23245,
		scrollID: 23182,
		timeToFinish: Time.Minute * 4.5
	},
	{
		name: 'Easy',
		table: Easy,
		id: 20546,
		scrollID: 2677,
		timeToFinish: Time.Minute * 6.5,
		milestoneReward: {
			itemReward: itemID('Large spade'),
			scoreNeeded: 500
		}
	},
	{
		name: 'Medium',
		table: Medium,
		id: 20545,
		scrollID: 2801,
		timeToFinish: Time.Minute * 9,
		milestoneReward: {
			itemReward: itemID('Clueless scroll'),
			scoreNeeded: 400
		}
	},
	{
		name: 'Hard',
		table: Hard,
		id: 20544,
		scrollID: 2722,
		timeToFinish: Time.Minute * 12.5
	},
	{
		name: 'Elite',
		table: Elite,
		id: 20543,
		scrollID: 12073,
		timeToFinish: Time.Minute * 15.7,
		milestoneReward: {
			itemReward: itemID('Heavy casket'),
			scoreNeeded: 200
		}
	},
	{
		name: 'Master',
		table: Master,
		id: 19836,
		scrollID: 19835,
		timeToFinish: Time.Minute * 19.3,
		milestoneReward: {
			itemReward: itemID('Scroll sack'),
			scoreNeeded: 100
		}
	}
];

export default ClueTiers;
