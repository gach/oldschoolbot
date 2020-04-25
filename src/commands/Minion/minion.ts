import { CommandStore, KlasaMessage, util } from 'klasa';
import { Util } from 'oldschooljs';
import { MessageEmbed } from 'discord.js';

import { BotCommand } from '../../lib/BotCommand';
import { Tasks, Activity, Emoji, Time, Events, Color, PerkTier } from '../../lib/constants';
import {
	formatDuration,
	randomItemFromArray,
	findMonster,
	isWeekend,
	itemNameFromID
} from '../../lib/util';
import { rand } from '../../util';
import clueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { SkillsEnum } from '../../lib/skilling/types';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { formatItemReqs } from '../../lib/util/formatItemReqs';
import { requiresMinion } from '../../lib/minions/decorators';

const invalidMonster = (prefix: string) =>
	`That isn't a valid monster, the available monsters are: ${killableMonsters
		.map(mon => mon.name)
		.join(', ')}. For example, \`${prefix}minion kill 5 zulrah\``;

const hasNoMinion = (prefix: string) =>
	`You don't have a minion yet. You can buy one by typing \`${prefix}minion buy\`.`;

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) =>
	randomItemFromArray(patMessages).replace('{name}', minionName);

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['m'],
			usage:
				'[clues|k|kill|setname|buy|clue|kc|pat|stats|mine|smith|quest|qp|chop|ironman|light|fish|laps|cook|smelt] [quantity:int{1}|name:...string] [name:...string]',

			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}
		return msg.send(msg.author.minionStatus);
	}

	async ironman(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		/**
		 * If the user is an ironman already, lets ask them if they want to de-iron.
		 */
		if (msg.author.isIronman) {
			await msg.send(
				`Would you like to stop being an ironman? You will keep all your items and stats but you will have to start over if you want to play as an ironman again. Please say \`deiron\` to confirm.`
			);
			try {
				await msg.channel.awaitMessages(
					answer =>
						answer.author.id === msg.author.id &&
						answer.content.toLowerCase() === 'deiron',
					{
						max: 1,
						time: 15000,
						errors: ['time']
					}
				);
				await msg.author.settings.update(UserSettings.Minion.Ironman, false);
				return msg.send('You are no longer an ironman.');
			} catch (err) {
				return msg.channel.send('Cancelled de-ironning.');
			}
		}

		await msg.send(
			`Are you sure you want to start over and play as an ironman?

:warning: **Read the following text before confirming. This is your only warning. ** :warning:

The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.

After becoming an ironman:
	- You will no longer be able to receive GP from  \`+daily\`
	- You will no longer be able to use \`+pay\`, \`+duel\`, \`+sellto\`, \`+sell\`, \`+dice\`
	- You can de-iron at any time, and keep all your stuff acquired while playing as an ironman.

Type \`confirm\` if you understand the above information, and want to become an ironman now.`
		);

		try {
			await msg.channel.awaitMessages(
				answer =>
					answer.author.id === msg.author.id &&
					answer.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: 15000,
					errors: ['time']
				}
			);

			msg.author.log(
				`just became an ironman, previous settings: ${JSON.stringify(
					msg.author.settings.toJSON()
				)}`
			);

			await msg.author.settings.reset([
				UserSettings.Bank,
				UserSettings.CollectionLogBank,
				UserSettings.GP,
				UserSettings.QP,
				UserSettings.MonsterScores,
				UserSettings.ClueScores,
				UserSettings.BankBackground,
				'gear',
				'stats',
				'skills'
			]);

			await msg.author.settings.update(UserSettings.Minion.Ironman, true);
			return msg.send('You are now an ironman.');
		} catch (err) {
			return msg.channel.send('Cancelled ironman swap.');
		}
	}

	async pat(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		return msg.send(randomPatMessage(msg.author.minionName));
	}

	async stats(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		return msg.send(`${msg.author.minionName}'s Stats:

${Emoji.Agility} Agility: ${msg.author.skillLevel(SkillsEnum.Agility)} (${msg.author.settings
			.get(UserSettings.Skills.Agility)
			.toLocaleString()} xp)
${Emoji.Cooking} Cooking: ${msg.author.skillLevel(SkillsEnum.Cooking)} (${msg.author.settings
			.get(UserSettings.Skills.Cooking)
			.toLocaleString()} xp)
${Emoji.Fishing} Fishing: ${msg.author.skillLevel(SkillsEnum.Fishing)} (${msg.author.settings
			.get(UserSettings.Skills.Fishing)
			.toLocaleString()} xp)
${Emoji.Mining} Mining: ${msg.author.skillLevel(SkillsEnum.Mining)} (${msg.author.settings
			.get(UserSettings.Skills.Mining)
			.toLocaleString()} xp)
${Emoji.Smithing} Smithing: ${msg.author.skillLevel(
			SkillsEnum.Smithing
		)} (${msg.author.settings.get(UserSettings.Skills.Smithing).toLocaleString()} xp)
${Emoji.Woodcutting} Woodcutting: ${msg.author.skillLevel(
			SkillsEnum.Woodcutting
		)} (${msg.author.settings.get(UserSettings.Skills.Woodcutting).toLocaleString()} xp)
${Emoji.Firemaking} Firemaking: ${msg.author.skillLevel(
			SkillsEnum.Firemaking
		)} (${msg.author.settings.get(UserSettings.Skills.Firemaking).toLocaleString()} xp)
${Emoji.Runecraft} Runecraft: ${msg.author.skillLevel(
			SkillsEnum.Runecraft
		)} (${msg.author.settings.get(UserSettings.Skills.Runecraft).toLocaleString()} xp)
${Emoji.QuestIcon} QP: ${msg.author.settings.get(UserSettings.QP)}
`);
	}

	async kc(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		const monsterScores = msg.author.settings.get(UserSettings.MonsterScores);
		const entries = Object.entries(monsterScores);
		if (entries.length === 0) throw `${msg.author.minionName} hasn't killed any monsters yet!`;

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle(`**${msg.author.minionName}'s KCs**`)
			.setDescription(
				`These are your minions Kill Counts for all monsters, to see your Clue Scores, use \`${msg.cmdPrefix}m clues\`.`
			);

		for (const monsterScoreChunk of util.chunk(entries, 10)) {
			embed.addField(
				'\u200b',
				monsterScoreChunk
					.map(([monID, monKC]) => {
						const mon = killableMonsters.find(m => m.id === parseInt(monID));
						if (!mon) return `??[${monID}]: ${monKC}`;
						return `${mon!.emoji} **${mon!.name}**: ${monKC}`;
					})
					.join('\n'),
				true
			);
		}

		return msg.send(embed);
	}

	async qp(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		return msg.send(
			`${msg.author.minionName}'s Quest Point count is: ${msg.author.settings.get(
				UserSettings.QP
			)}.`
		);
	}

	async clues(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		const clueScores = msg.author.settings.get(UserSettings.ClueScores);
		if (Object.keys(clueScores).length === 0) throw `You haven't done any clues yet.`;

		let res = `${Emoji.Casket} **${msg.author.minionName}'s Clue Scores:**\n\n`;
		for (const [clueID, clueScore] of Object.entries(clueScores)) {
			const clue = clueTiers.find(c => c.id === parseInt(clueID));
			res += `**${clue!.name}**: ${clueScore}\n`;
		}
		return msg.send(res);
	}

	async buy(msg: KlasaMessage) {
		if (msg.author.hasMinion) throw 'You already have a minion!';

		await msg.author.settings.sync(true);
		const balance = msg.author.settings.get(UserSettings.GP);

		let cost = 50_000_000;
		const accountAge = Date.now() - msg.author.createdTimestamp;
		if (accountAge > Time.Year || getUsersPerkTier(msg.author) >= PerkTier.One) {
			cost = 0;
		} else if (accountAge > Time.Month * 6) {
			cost = 25_000_000;
		}

		if (cost === 0) {
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);

			return msg.channel.send(
				`${Emoji.Gift} Your new minion is ready! Use \`${msg.cmdPrefix}minion\` to manage them, and check https://www.oldschool.gg/oldschoolbot for more information on them, and **make sure** to read the rules!`
			);
		}

		if (balance < cost) {
			throw `You can't afford to buy a minion! You need ${Util.toKMB(cost)}`;
		}

		await msg.send(
			`Are you sure you want to spend ${Util.toKMB(
				cost
			)} on buying a minion? Please say \`yes\` to confirm.`
		);

		try {
			await msg.channel.awaitMessages(
				answer =>
					answer.author.id === msg.author.id && answer.content.toLowerCase() === 'yes',
				{
					max: 1,
					time: 15000,
					errors: ['time']
				}
			);
			const response = await msg.channel.send(
				`${Emoji.Search} Finding the right minion for you...`
			);

			await util.sleep(3000);

			await response.edit(
				`${Emoji.FancyLoveheart} Letting your new minion say goodbye to the unadopted minions...`
			);

			await util.sleep(3000);

			await msg.author.settings.sync(true);
			const balance = msg.author.settings.get(UserSettings.GP);
			if (balance < cost) return;

			await msg.author.settings.update(UserSettings.GP, balance - cost);
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);

			await response.edit(
				`${Emoji.Gift} Your new minion is ready! Use \`${msg.cmdPrefix}minion\` to manage them.`
			);
		} catch (err) {
			return msg.channel.send('Cancelled minion purchase.');
		}
	}

	async setname(msg: KlasaMessage, [name]: [string]) {
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (
			!name ||
			typeof name !== 'string' ||
			name.length < 2 ||
			name.length > 30 ||
			['\n', '`', '@'].some(char => name.includes(char))
		) {
			throw 'Please specify a valid name for your minion!';
		}

		await msg.author.settings.update(UserSettings.Minion.Name, name);
		return msg.send(`Renamed your minion to ${Emoji.Minion} **${name}**`);
	}

	async fish(msg: KlasaMessage, [quantity, fishName]: [number, string]) {
		await this.client.commands
			.get('fish')!
			.run(msg, [quantity, fishName])
			.catch(err => {
				throw err;
			});
	}

	async laps(msg: KlasaMessage, [quantity, courseName]: [number, string]) {
		await this.client.commands
			.get('laps')!
			.run(msg, [quantity, courseName])
			.catch(err => {
				throw err;
			});
	}

	async mine(msg: KlasaMessage, [quantity, oreName]: [number, string]) {
		await this.client.commands
			.get('mine')!
			.run(msg, [quantity, oreName])
			.catch(err => {
				throw err;
			});
	}

	async smelt(msg: KlasaMessage, [quantity, barName]: [number, string]) {
		await this.client.commands
			.get('smelt')!
			.run(msg, [quantity, barName])
			.catch(err => {
				throw err;
			});
	}

	async cook(msg: KlasaMessage, [quantity, cookableName]: [number | string, string]) {
		await this.client.commands
			.get('cook')!
			.run(msg, [quantity, cookableName])
			.catch(err => {
				throw err;
			});
	}

	async smith(msg: KlasaMessage, [quantity, smithedBarName]: [number, string]) {
		this.client.commands
			.get('smith')!
			.run(msg, [quantity, smithedBarName])
			.catch(err => {
				throw err;
			});
	}

	async chop(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		this.client.commands.get('chop')!.run(msg, [quantity, logName]);
	}

	async light(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		this.client.commands.get('light')!.run(msg, [quantity, logName]);
	}

	async quest(msg: KlasaMessage) {
		await this.client.commands
			.get('quest')!
			.run(msg, [])
			.catch(err => {
				throw err;
			});
	}

	@requiresMinion
	async clue(msg: KlasaMessage, [quantity, tierName]: [number | string, string]) {
		await this.client.commands
			.get('mclue')!
			.run(msg, [quantity, tierName])
			.catch(err => {
				throw err;
			});
	}

	async k(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		await this.kill(msg, [quantity, name]).catch(err => {
			throw err;
		});
	}

	async kill(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		await msg.author.settings.sync(true);
		if (msg.author.minionIsBusy) {
			this.client.emit(
				Events.Log,
				`${msg.author.username}[${msg.author.id}] [TTK-BUSY] ${quantity} ${name}`
			);
			return msg.send(msg.author.minionStatus);
		}
		if (!msg.author.hasMinion) {
			throw hasNoMinion(msg.cmdPrefix);
		}

		if (!name) throw invalidMonster(msg.cmdPrefix);

		const monster = findMonster(name);

		if (!monster) throw invalidMonster(msg.cmdPrefix);

		const boosts = [];

		let [timeToFinish, percentReduced] = reducedTimeFromKC(
			monster,
			msg.author.settings.get(UserSettings.MonsterScores)[monster.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

		if (monster.itemInBankBoosts) {
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				if (!msg.author.hasItemEquippedOrInBank(parseInt(itemID))) continue;
				timeToFinish *= (100 - boostAmount) / 100;
				boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToFinish);
		}

		if (monster.qpRequired && msg.author.settings.get(UserSettings.QP) < monster.qpRequired) {
			throw `You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`${msg.cmdPrefix}quest\``;
		}

		// Make sure they have all the required items to kill this monster
		for (const item of monster.itemsRequired) {
			if (Array.isArray(item)) {
				if (!item.some(itemReq => msg.author.hasItemEquippedOrInBank(itemReq as number))) {
					throw `You need one of these items to kill ${monster.name}: ${formatItemReqs(
						monster.itemsRequired
					)}`;
				}
			} else if (!msg.author.hasItemEquippedOrInBank(item)) {
				throw `You need a ${itemNameFromID(item)} to kill ${monster.name}.`;
			}
		}

		let duration = timeToFinish * quantity;
		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on PvM trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${
				monster.name
			} is ${Math.floor(msg.author.maxTripLength / timeToFinish)}.`;
		}

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		const data: MonsterActivityTaskOptions = {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		let response = `${msg.author.minionName} is now killing ${data.quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
