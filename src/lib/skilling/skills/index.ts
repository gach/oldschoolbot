import { Collection } from 'discord.js';

import Cooking from './cooking';
import Mining from './mining';
import Smithing from './smithing';
import Woodcutting from './woodcutting';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Agility from './agility';
import { SkillsEnum } from '../types';
import Runecraft from './runecraft';

export type Skill =
	| typeof Agility
	| typeof Fishing
	| typeof Mining
	| typeof Smithing
	| typeof Woodcutting
	| typeof Firemaking
	| typeof Runecraft;

const Skills: Collection<string, Skill> = new Collection([
	[SkillsEnum.Agility, Agility as Skill],
	[SkillsEnum.Fishing, Fishing as Skill],
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Smithing, Smithing as Skill],
	[SkillsEnum.Woodcutting, Woodcutting as Skill],
	[SkillsEnum.Firemaking, Firemaking as Skill],
	[SkillsEnum.Runecraft, Runecraft as Skill]
]);

export default Skills;
