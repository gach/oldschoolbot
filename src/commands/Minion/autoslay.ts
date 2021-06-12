import { CommandStore, KlasaMessage } from 'klasa';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { AutoslayOptionsEnum, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[_mode:...string]',
			aliases: ['as', 'slay'],
			usageDelim: ' ',
			description:
				'Automatically chooses which monster to slay and sends your minion to kill it.',
			examples: ['+autoslay', '+autoslay highest --save', '+autoslay default']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [_mode = '']: [string]) {
		const autoslayOptions = msg.author.settings.get(UserSettings.Slayer.AutoslayOptions);
		if (_mode === 'check' || msg.flagArgs.check) {
			const autoMsg = autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)
				? 'You will automatically kill the highest combat level creatures you can.'
				: 'You will automatically kill the default (lowest combat level) creatures you can.';
			return msg.channel.send(autoMsg);
		}
		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask = usersTask.assignedTask !== null && usersTask.currentTask !== null;

		if (!isOnTask) {
			return msg.channel.send(`You're not on a slayer task, so you can't autoslay!`);
		}
		if (
			(_mode === '' && !autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) ||
			_mode === 'default' ||
			_mode === 'lowest' ||
			msg.flagArgs.lowest
		) {
			// This code handles the default option for autoslay:
			if (
				msg.flagArgs.save &&
				autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)
			) {
				// Save lowest as the default if 'highest' is toggled ON.
				await msg.author.settings.update(
					UserSettings.Slayer.AutoslayOptions,
					AutoslayOptionsEnum.HighestUnlocked
				);
			}
			return this.client.commands
				.get('k')
				?.run(msg, [null, usersTask.assignedTask!.monster.name]);
		} else if (
			(_mode === '' && autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) ||
			_mode === 'highest' ||
			_mode === 'boss' ||
			msg.flagArgs.boss ||
			msg.flagArgs.highest
		) {
			// This code handles the 'highest/boss' setting of autoslay.
			const myQPs = await msg.author.settings.get(UserSettings.QP);

			if (
				msg.flagArgs.save &&
				!autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)
			) {
				// Save highest as the default if 'highest' is toggled OFF.
				await msg.author.settings.update(
					UserSettings.Slayer.AutoslayOptions,
					AutoslayOptionsEnum.HighestUnlocked
				);
			}
			const allMonsters = killableMonsters.filter(m => {
				return usersTask.assignedTask!.monsters.includes(m.id);
			});
			if (allMonsters.length === 0)
				return msg.channel.send(`Please report this error. No monster variations found.`);
			let maxDiff = 0;
			let maxMobName = '';
			// Use difficultyRating for autoslay highest.
			allMonsters.forEach(m => {
				if (
					m.difficultyRating > maxDiff &&
					(m.levelRequirements === undefined ||
						msg.author.hasSkillReqs(m.levelRequirements))
				) {
					if (m.qpRequired === undefined || m.qpRequired <= myQPs) {
						maxDiff = m.difficultyRating;
						maxMobName = m.name;
					}
				}
			});
			if (maxMobName !== '') {
				return this.client.commands.get('k')?.run(msg, [null, maxMobName]);
			}
			return msg.channel.send(`Can't find any monsters you have the requirements to kill!`);
		}
		return msg.channel.send(
			`Unrecognized mode. Please use:\n\`${msg.cmdPrefix}as [default|highest]\``
		);
	}
}
