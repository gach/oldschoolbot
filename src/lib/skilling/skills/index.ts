import { Skill } from '../types';
import Agility from './agility';
import Construction from './construction';
import Cooking from './cooking';
import Crafting from './crafting';
import Farming from './farming';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Fletching from './fletching';
import Mining from './mining';
import Prayer from './prayer';
import Runecraft from './runecraft';
import Smithing from './smithing';
import Thieving from './thieving';
import Woodcutting from './woodcutting';

export const Skills: Record<string, Skill> = {
	Crafting,
	Agility,
	Cooking,
	Fishing,
	Mining,
	Smithing,
	Woodcutting,
	Firemaking,
	Prayer,
	Runecraft,
	Fletching,
	Thieving,
	Farming,
	Construction
};

export default Skills;
